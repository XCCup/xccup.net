package application;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class OlcProxy {

	private final String	FOLDER	= "C:\\Users\\Kai\\xccup\\XCCup-2.0\\olc\\IgcShortner\\src\\application\\";
	private final String	COMMAND	= FOLDER + "olc.exe";

	public List<String> exec(final List<String> linesOfIgcFile) throws IOException {
		final String inputContent = String.join("\n", linesOfIgcFile);
		return runProcess(inputContent);
	}

	public List<String> exec(final Path igcFile) throws IOException {
		return exec(Files.readAllLines(igcFile));
	}

	private List<String> runProcess(final String inputContent) throws IOException {
		final ProcessBuilder builder = new ProcessBuilder(COMMAND);
		builder.directory(new File(FOLDER));
		final Process process = builder.start();

		final OutputStream stdin = process.getOutputStream();
		final InputStream stdout = process.getInputStream();

		final BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(stdin));

		writer.write(inputContent);
		writer.flush();
		writer.close();

		final Scanner scanner = new Scanner(stdout);
		final List<String> result = new ArrayList<>();
		while (scanner.hasNextLine()) {
			result.add(scanner.nextLine());
		}
		return result;
	}

}
