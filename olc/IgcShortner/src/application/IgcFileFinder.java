package application;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

public class IgcFileFinder {

	public static List<Path> find() throws IOException {
		final String IGC_DIR = "src\\igc-files";
		final List<Path> files = Files.walk(Paths.get(IGC_DIR)).filter(path -> path.toString().endsWith(".igc"))
				.collect(Collectors.toList());
		files.forEach(file -> System.out.println("File found " + file));
		return files;
	}

}
