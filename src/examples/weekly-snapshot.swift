// Illustrative only. No HealthKit query, no network, no device read.
struct DaySnapshot {
    let date: Date
    let restingHeartRate: Double?
    let steps: Int
    let sleepHours: Double
}

func weeklySnapshot(days: [DaySnapshot]) -> (averageRestingRate: Double?, totalSteps: Int, averageSleep: Double) {
    let rates = days.compactMap(\.restingHeartRate)
    let averageRate = rates.isEmpty ? nil : rates.reduce(0, +) / Double(rates.count)
    let totalSteps = days.reduce(0) { $0 + $1.steps }
    let averageSleep = days.isEmpty ? 0 : days.reduce(0) { $0 + $1.sleepHours } / Double(days.count)
    return (averageRate, totalSteps, averageSleep)
}
