const IgcAnalyzer = require('../igc/IgcAnalyzer');

test('Validate an igc-File which should result to a FAI triangle', done => {
    process.env.FLIGHT_STORE="./igc/demo_igcs"
    
    const expectedFlight = {
        id: "kai_fai",
        type: "FAI",
        dist: "60.428",
        // In comparison to dist, the pts value will be of type integer. 
        // This happens due to the fact that the pts value is a result of the multiplication of dist and the factor for the glider.
        pts: 361.35944,
        turnpoints: {
            time: '13:33:04', lat: 49.86705, long: 6.8431,
        }
    };

    try {
        IgcAnalyzer.startCalculation(expectedFlight, (result)=>{
            expect(result.type).toBe(expectedFlight.type);
            expect(result.pts).toBe(expectedFlight.pts);
            expect(result.dist).toBe(expectedFlight.dist);
            expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
            expect(result.flightId).toBe(expectedFlight.id);
            done();
        });
    } catch (error) {
        done(error)
    }
});

test('Validate an igc-File which should result to a FLAT triangle', done => {
    process.env.FLIGHT_STORE="./igc/demo_igcs"
    
    const expectedFlight = {
        id: "kai_flat",
        type: "FLAT",
        dist: "97.107",
        // In comparison to dist, the pts value will be of type integer. 
        // This happens due to the fact that the pts value is a result of the multiplication of dist and the factor for the glider.
        pts: 530.20422,
        turnpoints: {
            time: '14:13:06', lat: 49.78081666666667, long: 6.6822,
        }
    };

    try {
        IgcAnalyzer.startCalculation(expectedFlight, (result)=>{
            expect(result.type).toBe(expectedFlight.type);
            expect(result.pts).toBe(expectedFlight.pts);
            expect(result.dist).toBe(expectedFlight.dist);
            expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
            expect(result.flightId).toBe(expectedFlight.id);
            done();
        });
    } catch (error) {
        done(error)
    }
});

test('Validate an igc-File which should result to a free flight', done => {
    process.env.FLIGHT_STORE="./igc/demo_igcs"
    
    const expectedFlight = {
        id: "kai_free",
        type: "FREE",
        dist: "79.353",
        // In comparison to dist, the pts value will be of type integer. 
        // This happens due to the fact that the pts value is a result of the multiplication of dist and the factor for the glider.
        pts: 226.94957999999997,
        turnpoints: {
            time: '12:36:24', lat: 50.3127, long: 7.42125,
        }
    };

    try {
        IgcAnalyzer.startCalculation(expectedFlight, (result)=>{
            expect(result.type).toBe(expectedFlight.type);
            expect(result.pts).toBe(expectedFlight.pts);
            expect(result.dist).toBe(expectedFlight.dist);
            expect(result.turnpoints[2]).toStrictEqual(expectedFlight.turnpoints);
            expect(result.flightId).toBe(expectedFlight.id);
            done();
        });
    } catch (error) {
        done(error)
    }
});