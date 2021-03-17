package application;

import java.io.IOException;
import java.nio.file.Path;
import java.text.DecimalFormat;
import java.time.Duration;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Analyser {

	private static void compareResult(final List<String> result, final Path file) {
		final String fileName = file.getFileName().toString();
		Matcher matcher = Pattern.compile(Constants.FILE_INFO_REGEX).matcher(fileName);
		matcher.matches();
		final String type = matcher.group(Constants.FILE_INFO_TYPE);
		final double distance = Double
				.parseDouble(matcher.group(Constants.FILE_INFO_KM) + "." + matcher.group(Constants.FILE_INFO_M));
		final double time = Double
				.parseDouble(matcher.group(Constants.FILE_INFO_H) + "." + matcher.group(Constants.FILE_INFO_M));

		final Map<String, Double> results = new HashMap<>();

		final Pattern pattern = Pattern.compile(".* (\\d+\\.\\d{3}) km.*");
		for (final String line : result) {
			matcher = pattern.matcher(line);
			if (matcher.matches()) {
				final String distanceResult = matcher.group(1);
				if (line.contains("Best free Triangle")) {
					results.put("Drei", Double.parseDouble(distanceResult));
				}
				if (line.contains("Best free Flight")) {
					results.put("Jojo", Double.parseDouble(distanceResult));
				}
				if (line.contains("bestes FAI Dreieck")) {
					results.put("FAI", Double.parseDouble(distanceResult));
				}
			}
		}
		final Double maxDistance = retrieveMaxDistance(results);
		System.out.println("Value from XCCup: \n" + type + ": " + distance);
		System.out.println("Value from local: ");
		results.forEach((k, v) -> System.out.println(k + ": " + v));
		final DecimalFormat df = new DecimalFormat("0.00");
		System.out.println("The difference is: " + df.format(Math.abs(distance - maxDistance)) + "km");
	}

	public static void main(final String[] args) throws IOException {
		final int[] factors = { 7, 10, 15, 20 };

		final List<Path> igcFiles = IgcFileFinder.find();
		final OlcProxy olcProxy = new OlcProxy();

		for (final Path file : igcFiles) {
			for (final int factor : factors) {
				final FileShrinker fileShrinker = FileShrinker.run(file, factor);
				final LocalTime start = LocalTime.now();
				System.out.println("Running " + file.getFileName() + " with factor " + factor);
				final List<String> result = olcProxy.exec(fileShrinker.getReducedLineSet());
				compareResult(result, file);
				final LocalTime end = LocalTime.now();
				final Duration duration = Duration.between(start, end);
				System.out.println("It took " + duration.toString() + " to process " + file.getFileName()
						+ " with factor " + factor + "\n");
			}
		}
	}

	private static Double retrieveMaxDistance(final Map<String, Double> results) {
		final Map<String, Double> weightedDistance = new HashMap<>();
		for (final Entry<String, Double> entry : results.entrySet()) {
			switch (entry.getKey()) {
			case "Drei":
				weightedDistance.put(entry.getKey(), entry.getValue() * 1.25);
				break;
			case "FAI":
				weightedDistance.put(entry.getKey(), entry.getValue() * 1.5);
				break;
			default:
				weightedDistance.put(entry.getKey(), entry.getValue() * 1);
			}
		}
		final Double maxWeighted = weightedDistance.values().stream().max(Double::compareTo).get();
		final String keyMaxWeighted = weightedDistance.entrySet().stream()
				.filter(entry -> entry.getValue().equals(maxWeighted)).findAny().map(entry -> entry.getKey()).get();
		return results.get(keyMaxWeighted);
	}

}
