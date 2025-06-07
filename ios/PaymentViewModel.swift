import Foundation
import Combine
import LocalAuthentication

struct Transaction: Identifiable, Codable {
    let id: Int
    let from: Int
    let to: Int
    let amount: Double
    let date: String
}

class PaymentViewModel: ObservableObject {
    @Published var balance: Double = 0
    @Published var recipient: String = ""
    @Published var amount: String = ""
    @Published var history: [Transaction] = []

    private let baseURL = URL(string: "http://localhost:4000/api")!
    private var cancellables = Set<AnyCancellable>()
    private let userId: Int = 1 // Example current user

    func refresh() {
        fetchBalance()
        fetchHistory()
    }

    func fetchBalance() {
        let url = baseURL.appendingPathComponent("balance/\(userId)")
        URLSession.shared.dataTaskPublisher(for: url)
            .map { $0.data }
            .decode(type: [String: Double].self, decoder: JSONDecoder())
            .replaceError(with: ["balance": 0])
            .receive(on: DispatchQueue.main)
            .sink { [weak self] dict in
                self?.balance = dict["balance"] ?? 0
            }
            .store(in: &cancellables)
    }

    func fetchHistory() {
        let url = baseURL.appendingPathComponent("transactions/\(userId)")
        URLSession.shared.dataTaskPublisher(for: url)
            .map { $0.data }
            .decode(type: [Transaction].self, decoder: JSONDecoder())
            .replaceError(with: [])
            .receive(on: DispatchQueue.main)
            .sink { [weak self] history in
                self?.history = history
            }
            .store(in: &cancellables)
    }

    func authenticate(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        var error: NSError?
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Authenticate to send payment") { success, _ in
                DispatchQueue.main.async {
                    completion(success)
                }
            }
        } else {
            completion(true)
        }
    }

    func send() {
        guard let amt = Double(amount), let toId = Int(recipient) else { return }
        authenticate { [weak self] success in
            guard success else { return }
            self?.performSend(to: toId, amount: amt)
        }
    }

    private func performSend(to toId: Int, amount: Double) {
        var request = URLRequest(url: baseURL.appendingPathComponent("send"))
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["fromId": userId, "toId": toId, "amount": amount] as [String : Any]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { [weak self] data, _, _ in
            guard let data = data,
                  let tx = try? JSONDecoder().decode(Transaction.self, from: data) else { return }
            DispatchQueue.main.async {
                self?.amount = ""
                self?.recipient = ""
                self?.refresh()
            }
        }.resume()
    }
}
