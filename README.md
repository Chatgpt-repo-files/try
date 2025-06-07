# PeerPay - NFC Peer-to-Peer Payment Example

This repository demonstrates a simplified peer-to-peer payment system with a Node.js backend and a SwiftUI iOS client. The key feature is support for NFC "tap to pay" transfers between devices using Apple's latest frameworks.

## Backend

The backend (in `backend/payments.js`) provides minimal REST endpoints for managing users and transactions.

Run the server:

```bash
cd backend
npm install
node payments.js
```

Endpoints:

- `POST /api/users` – create a user
- `GET /api/balance/:id` – current balance
- `GET /api/transactions/:id` – transaction history
- `POST /api/send` – send a payment between users

Data is stored locally in `paymentData.json` for demonstration purposes.

## iOS Client

The SwiftUI code under `ios/` is a basic prototype. It includes:

- `ContentView` and `PaymentViewModel` to list the user's balance and history and send payments.
- `PaymentProcessor` to integrate with **Apple Pay** (`PassKit`) for secure payment authorization.
- `NFCManager` which shows how to start an `NFCTagReaderSession` for peer-to-peer communication.

### Implementing Tap to Pay NFC

Apple provides the `Tap to Pay on iPhone` APIs that allow an iPhone to act as a contactless payment terminal. In this sample, `NFCManager` starts an `NFCTagReaderSession` using the `.iso18092` polling option (used for peer-to-peer NFC). When a peer device is detected, an APDU command can be exchanged to transfer a payment token. In a production app you would obtain a `PKPaymentToken` from `PKPaymentAuthorizationController` and send it securely over NFC to the recipient's device or backend for processing.

The basic steps are:

1. Begin the NFC session when the user taps "Send".
2. The devices connect via NFC and exchange a small payload containing payment data (e.g., an encrypted payment token).
3. The recipient processes the token with its backend or directly with Apple Pay, completing the transfer.

### Authentication

`PaymentViewModel` uses `LocalAuthentication` (`Face ID` / `Touch ID`) before sending a payment. This ensures only the device owner can authorize transfers.

## Disclaimer

This project is a minimal example and not production ready. A real implementation would require a secure backend with proper payment processing, error handling, and compliance with Apple's `Tap to Pay on iPhone` requirements.
