import Foundation
import PassKit

class PaymentProcessor: NSObject, PKPaymentAuthorizationControllerDelegate {
    private var completion: ((Bool) -> Void)?

    func pay(amount: Double, completion: @escaping (Bool) -> Void) {
        self.completion = completion
        let request = PKPaymentRequest()
        request.merchantIdentifier = "merchant.com.example.peerpay"
        request.supportedNetworks = [.visa, .masterCard, .amex]
        request.merchantCapabilities = .capability3DS
        request.countryCode = "US"
        request.currencyCode = "USD"
        request.paymentSummaryItems = [
            PKPaymentSummaryItem(label: "Peer Payment", amount: NSDecimalNumber(value: amount))
        ]
        let controller = PKPaymentAuthorizationController(paymentRequest: request)
        controller.delegate = self
        controller.present(completion: nil)
    }

    func paymentAuthorizationController(_ controller: PKPaymentAuthorizationController, didAuthorizePayment payment: PKPayment, handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
        // Send payment token to backend for processing
        completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
        self.completion?(true)
    }

    func paymentAuthorizationControllerDidFinish(_ controller: PKPaymentAuthorizationController) {
        controller.dismiss()
    }
}
