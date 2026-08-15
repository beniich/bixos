<?php
// includes/Services/PaymentService.php
namespace EcoAsset\Services;

class PaymentService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Initialiser une transaction (Stripe, PayPal, etc.)
     * ✅ Confirmer un paiement
     * ✅ Gérer les remboursements
     * ✅ Calculer les commissions de la plateforme
     * ✅ Générer les factures
     * ✅ Reconcilier les paiements
     */

    private $booking_service;

    public function __construct() {
        $this->booking_service = new BookingService();
    }

    /**
     * Traite un paiement
     */
    public function process( int $booking_id, array $payment_data ): array {
        $booking = $this->booking_service->get_by_id( $booking_id );
        
        // 1. Valider la méthode de paiement
        $gateway = $this->get_gateway( $payment_data['method'] );
        if ( ! $gateway ) {
            return [ 'success' => false, 'error' => 'Méthode de paiement invalide' ];
        }

        // 2. Créer la transaction
        $transaction = $this->create_transaction( $booking, $payment_data );

        // 3. Appeler la passerelle
        $result = $gateway->charge( $transaction );

        if ( $result['success'] ) {
            $this->booking_service->confirm( $booking_id );
            $this->update_transaction_status( $transaction['id'], 'succeeded' );
        }

        return $result;
    }

    public function refund( int $booking_id, float $amount = null ): array {
        $booking = $this->booking_service->get_by_id( $booking_id );
        $refund_amount = $amount ?? $booking->total;

        // Logique de remboursement via passerelle
        // ...

        $this->booking_service->cancel( $booking_id, 'refunded' );

        return [ 'success' => true, 'amount' => $refund_amount ];
    }

    private function get_gateway( string $method ) {
        // Instanciation de la gateway (ex: StripeGateway)
        // Dummy mock for now
        return new class {
            public function charge( $transaction ) {
                return [ 'success' => true ];
            }
        };
    }

    private function create_transaction( $booking, $data ) {
        return [
            'id' => uniqid('txn_'),
            'amount' => $booking->total,
            'currency' => 'EUR'
        ];
    }

    private function update_transaction_status( string $txn_id, string $status ) {
        // Update DB
    }
}
