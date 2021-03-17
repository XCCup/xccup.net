package application;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FileShrinker {

	private static List<String>	allLines;

	private List<String>		reducedLineSet;

	private static void readFile(final Path pathToIgcFile) {
		try {
			System.out.println("Begin reading from file: " + pathToIgcFile);
			allLines = Files.readAllLines(pathToIgcFile);
		} catch (final IOException e) {
			e.printStackTrace();
		}
	}

	public static FileShrinker run(final Path pathToIgcFile, final int factor) {
		return new FileShrinker(pathToIgcFile, factor);
	}

	public FileShrinker(final Path pathToIgcFile, final int factor) {
		readFile(pathToIgcFile);
		removePositionsWithSameTimestamp();
		shrink(factor);
//		writeShrinkedFile(pathToIgcFile);
	}

	public List<String> getReducedLineSet() {
		return reducedLineSet;
	}

	private void removePositionsWithSameTimestamp() {
		System.out.println("Will remove lines with duplicated timestamps");
		final Pattern pattern = Pattern.compile(Constants.IGC_POS_TIME_REGEX);
		Matcher matcher;
		int currentTimestamp = 0;
		final List<String> duplicatedLines = new ArrayList<>();
		for (final String line : allLines) {
			matcher = pattern.matcher(line);
			if (matcher.matches()) {
				final int retrievedTimestamp = retrieveTimestamp(matcher);
				if (retrievedTimestamp != currentTimestamp) {
					currentTimestamp = retrievedTimestamp;
				} else {
					duplicatedLines.add(line);
				}
			}
		}
		System.out.println("Removed " + duplicatedLines.size() + " in total");
		allLines.removeAll(duplicatedLines);
	}

	private int retrieveTimestamp(final Matcher matcher) {
		// @formatter:off
		return Integer.parseInt(matcher.group(Constants.IGC_POS_HOUR) + matcher.group(Constants.IGC_POS_MINUTE)
				+ matcher.group(Constants.IGC_POS_SECOND));
		// @formatter:on
	}

	/**
	 * All lines which don't match the regex for a IGC Position will always be
	 * copied. Only lines which contain a position will be shrunken.
	 *
	 * @param factor
	 */
	private void shrink(final int factor) {
		System.out.println("Begin shrinking for factor: " + factor);
		final Pattern pattern = Pattern.compile(Constants.IGC_POS_TIME_REGEX);
		Matcher matcher;
		reducedLineSet = new ArrayList<>();
		int shrinkingCounter = 0;
		for (int i = 0; i < allLines.size(); i++) {
			final String line = allLines.get(i);
			matcher = pattern.matcher(line);
			if (matcher.matches()) {
				if (shrinkingCounter == 0) {
					reducedLineSet.add(line);
				}
				shrinkingCounter++;
				if (shrinkingCounter == factor) {
					shrinkingCounter = 0;
				}
			} else {
				shrinkingCounter = 0;
				reducedLineSet.add(line);
			}
		}
	}

//	private void writeShrinkedFile(final String pathToIgcFile) {
//		final String shrinkedFilePath = pathToIgcFile.replace(".igc", "_shringed.igc");
//		System.out.println("Will write shrinked file to: " + shrinkedFilePath);
//		final byte[] bytes = String.join("\n", linesToKeep).getBytes();
//		try {
//			Files.write(Paths.get(shrinkedFilePath), bytes);
//		} catch (final IOException e) {
//			e.printStackTrace();
//		}
//	}

}
