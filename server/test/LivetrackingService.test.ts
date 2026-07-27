const mockSchedule = jest.fn();
const mockFindAll = jest.fn();
const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();
let mockLiveTrackingEnabled = true;

jest.mock("node-cron", () => ({
  __esModule: true,
  default: { schedule: mockSchedule },
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: mockAxiosGet,
    post: mockAxiosPost,
  },
}));

jest.mock("../db", () => ({
  __esModule: true,
  default: {
    User: { findAll: mockFindAll },
  },
}));

jest.mock("../config/logger", () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../config/env-config", () => ({
  __esModule: true,
  default: {
    get: jest.fn((key: string) => {
      const values: Record<string, string | boolean> = {
        flarmUrl: "https://flarm.example/flarm",
        flarmApiKey: "test-key",
        liveTrackingEnabled: mockLiveTrackingEnabled,
        igcXcScoreHost: "igc-xc-score",
        timezone: "Europe/Berlin",
      };
      return values[key];
    }),
  },
}));

import liveTrackingService from "../service/LivetrackingService";

type ScheduledCallback = () => Promise<void>;

test("fetches, scores, and caches configured live tracks", async () => {
  expect(mockSchedule).toHaveBeenCalledWith(
    "* 8-21 * * *",
    expect.any(Function),
    {
      noOverlap: true,
      timezone: "Europe/Berlin",
    }
  );

  mockFindAll.mockResolvedValue([
    { flarmId: "", firstName: "Ignored", lastName: "Pilot" },
    { flarmId: "ABC123", firstName: "Live", lastName: "Pilot" },
  ]);

  const fixes = Array.from({ length: 8 }, (_, index) => ({
    address: "ABC123",
    timestamp: 1_700_000_000 + index * 10,
    altitude: 500 + index,
    lon: 7 + index / 100,
    lat: 50 + index / 100,
  }));

  mockAxiosGet.mockResolvedValue({
    data: {
      tracks: { ABC123: fixes },
      distances: {},
    },
  });
  mockAxiosPost.mockResolvedValue({ data: 42.5 });

  const scheduledFetch = mockSchedule.mock.calls[0][1] as ScheduledCallback;
  await scheduledFetch();

  expect(mockAxiosGet).toHaveBeenCalledWith(
    "https://flarm.example/flarm/ABC123",
    {
      headers: { "API-Key": "test-key" },
      timeout: 20_000,
    }
  );
  expect(mockAxiosPost).toHaveBeenCalledWith(
    "http://igc-xc-score:3030",
    expect.arrayContaining([
      expect.objectContaining({
        timestamp: fixes[0].timestamp,
        latitude: fixes[0].lat,
        longitude: fixes[0].lon,
        valid: true,
      }),
    ]),
    { timeout: 20_000 }
  );
  expect(liveTrackingService.getActive()).toEqual([
    {
      name: "Live Pilot",
      distance: 42.5,
      fixes,
    },
  ]);
  expect(liveTrackingService.getActiveDistances()).toEqual([
    {
      user: { fullName: "Live Pilot" },
      flightDistance: 42.5,
      id: "ABC123",
      isLive: true,
      track: [
        {
          lat: fixes[0].lat,
          long: fixes[0].lon,
          timestamp: fixes[0].timestamp * 1000,
        },
        {
          lat: fixes[6].lat,
          long: fixes[6].lon,
          timestamp: fixes[6].timestamp * 1000,
        },
      ],
    },
  ]);
});

test("does not schedule collection when live tracking is disabled", () => {
  mockSchedule.mockClear();
  mockLiveTrackingEnabled = false;

  jest.isolateModules(() => {
    const disabledModule = require("../service/LivetrackingService");
    const disabledService = disabledModule.default ?? disabledModule;

    expect(disabledService.getActive()).toEqual([]);
  });

  expect(mockSchedule).not.toHaveBeenCalled();
  mockLiveTrackingEnabled = true;
});
