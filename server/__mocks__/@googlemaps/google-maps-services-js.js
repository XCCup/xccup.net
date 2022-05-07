class Client {
  constructor() {
    console.log("##### Will use a mock for google client #####");
  }

  elevation({ params }) {
    return new Promise((resolve) => {
      const response = {
        data: {
          results: [],
        },
      };
      if (!params.locations) {
        console.log("##### param locations not set");
        return resolve(response);
      }
      if (!params.key) {
        console.log("##### param key not set");
        return resolve(response);
      }

      const locations = params.locations;

      response.data.results = locations.map((fix) => {
        let elevation = 42;
        if (fix.lat == 50.10681 && fix.lng == 7.11481) elevation = 356;
        if (fix.lat == 50.10681 && fix.lng == 7.11483) elevation = 355;

        return {
          ...fix,
          elevation,
        };
      });

      resolve(response);
    });
  }
}

module.exports.Client = Client;
