import HealthKit
import SwiftUI

// Fixed sample value; no HealthKit query or device read.
struct SampleHeartRateCard: View {
    private let sample = HKQuantity(
        unit: HKUnit.count().unitDivided(by: HKUnit.minute()),
        doubleValue: 72
    )

    var body: some View {
        VStack(alignment: .leading) {
            Text("Synthetic heart rate")
            Text("\(Int(sample.doubleValue(for: HKUnit.count().unitDivided(by: HKUnit.minute())))) BPM")
                .font(.title2)
        }
        .accessibilityElement(children: .combine)
    }
}
