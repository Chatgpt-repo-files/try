import Foundation
import CoreNFC
import PassKit

class NFCManager: NSObject, NFCTagReaderSessionDelegate {
    private var session: NFCTagReaderSession?

    // Initiate NFC session for peer-to-peer payment
    func beginSession() {
        session = NFCTagReaderSession(pollingOption: [.iso18092], delegate: self)
        session?.alertMessage = "Hold your iPhone near another to pay"
        session?.begin()
    }

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {}

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        print("Session invalidated: \(error.localizedDescription)")
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard let firstTag = tags.first else { return }
        session.connect(to: firstTag) { error in
            if let error = error {
                print("Connection error: \(error.localizedDescription)")
                session.invalidate()
                return
            }
            // Example of sending minimal payment data to the peer tag
            if case let .iso7816(tag) = firstTag {
                let payload = "PAY".data(using: .utf8)!
                let apdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x04, p2Parameter: 0x00, data: payload, expectedResponseLength: 256)
                tag.sendCommand(apdu: apdu) { response, sw1, sw2, error in
                    if let error = error {
                        print("APDU error: \(error.localizedDescription)")
                    }
                    session.invalidate()
                }
            } else {
                session.invalidate()
            }
        }
    }
}
