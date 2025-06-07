import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = PaymentViewModel()
    
    var body: some View {
        NavigationView {
            VStack {
                Text("Balance: $\(viewModel.balance, specifier: "%.2f")")
                    .font(.largeTitle)
                    .padding()
                
                TextField("Recipient ID", text: $viewModel.recipient)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                TextField("Amount", text: $viewModel.amount)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                    .keyboardType(.decimalPad)
                
                Button("Send") {
                    viewModel.send()
                }
                .padding()
                
                List(viewModel.history) { tx in
                    VStack(alignment: .leading) {
                        Text("Transaction #\(tx.id)")
                        Text("From: \(tx.from) To: \(tx.to) Amount: $\(tx.amount, specifier: "%.2f")")
                    }
                }
            }
            .navigationTitle("PeerPay")
            .onAppear { viewModel.refresh() }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
