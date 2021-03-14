package application;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class IgcPosTimeRegexTest {

	private final String	valid1		= "B1230454924243N00843582EA0047400543";
	private final String	valid2		= "B1041195006201N00706479EA003660044536";
	private final String	nonValid1	= "LXCTDEVICE iJhNXkxN2x0ZXh4Iiwic2RrIjoyNiwidGltZXpvbmUiOiJFdXJvcGUvQmVybGluIn";
	private final String	nonValid2	= "C5001674N00656388ETURN WPT4";

	private Pattern			pattern;

	@BeforeEach
	void setUp() {
		pattern = Pattern.compile(Constants.IGC_POS_TIME_REGEX);
	}

	@Test
	void testNonValid1() {
		final Matcher matcher = pattern.matcher(nonValid1);
		assertThat(matcher.matches(), is(false));
	}

	@Test
	void testNonValid2() {
		final Matcher matcher = pattern.matcher(nonValid2);
		assertThat(matcher.matches(), is(false));
	}

	@Test
	void testValid1() {
		final Matcher matcher = pattern.matcher(valid1);
		matcher.matches();

		final String hour = matcher.group(Constants.IGC_POS_HOUR);
		final String minute = matcher.group(Constants.IGC_POS_MINUTE);
		final String second = matcher.group(Constants.IGC_POS_SECOND);

		assertThat(hour, is("12"));
		assertThat(minute, is("30"));
		assertThat(second, is("45"));
	}

	@Test
	void testValid2() {
		final Matcher matcher = pattern.matcher(valid2);
		matcher.matches();

		final String hour = matcher.group(Constants.IGC_POS_HOUR);
		final String minute = matcher.group(Constants.IGC_POS_MINUTE);
		final String second = matcher.group(Constants.IGC_POS_SECOND);

		assertThat(hour, is("10"));
		assertThat(minute, is("41"));
		assertThat(second, is("19"));
	}

}
