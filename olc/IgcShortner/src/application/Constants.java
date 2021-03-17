package application;

public class Constants {

	public static String	IGC_POS_TIME_REGEX	= "B(\\d{2})(\\d{2})(\\d{2}).*";
	public static int		IGC_POS_HOUR		= 1;
	public static int		IGC_POS_MINUTE		= 2;
	public static int		IGC_POS_SECOND		= 3;

	public static String	FILE_INFO_REGEX		= "(.*)_(\\d+)km(\\d+)_(\\d+)h(\\d+)m.igc";
	public static int		FILE_INFO_TYPE		= 1;
	public static int		FILE_INFO_KM		= 2;
	public static int		FILE_INFO_M			= 3;
	public static int		FILE_INFO_H			= 4;
	public static int		FILE_INFO_MIN		= 5;

}
