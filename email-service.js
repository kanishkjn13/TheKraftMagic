// Email Service for Order Confirmations
// Automated email system that triggers on order_confirmed event

class EmailService {
    constructor() {
        this.config = {
            service_id: 'service_ug4iixh',
            template_id: 'template_f4ctzx5',
            public_key: 'Sa7zOQZVHDuADGdUI'
        };
    }

    // Initialize EmailJS
    init() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: this.config.public_key
            });
            return true;
        }
        return false;
    }

    // Main function to handle order confirmation email
    async handleOrderConfirmationEmail(orderData) {
        try {
            if (!this.init()) {
                console.error('EmailJS not loaded');
                return { success: false, error: 'EmailJS not available' };
            }

            // Validate required data
            if (!orderData.customerEmail || !orderData.shippingAddress?.email) {
                console.error('No customer email found');
                return { success: false, error: 'No customer email provided' };
            }

            // Prepare email data according to workflow specification
            const emailData = this.prepareEmailData(orderData);
            
            // Send email using EmailJS
            const result = await emailjs.send(
                this.config.service_id,
                this.config.template_id,
                emailData,
                this.config.public_key
            );

            console.log('Order confirmation email sent successfully:', result);
            return { success: true, result };

        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            return { success: false, error: error.message };
        }
    }

    // Prepare email data according to workflow specification
    prepareEmailData(orderData) {
        // Use address.email as specified in workflow
        const toEmail = orderData.shippingAddress?.email || orderData.customerEmail;
        
        // Format order items for email
        const orderItemsText = this.formatOrderItems(orderData.items);
        
        // Format shipping address
        const shippingAddressText = this.formatShippingAddress(orderData.shippingAddress);

        return {
            to_email: toEmail,
            customer_name: orderData.customerName,
            order_number: orderData.orderNumber,
            order_date: orderData.orderDate,
            order_items: orderItemsText,
            subtotal: `₹${orderData.totals.subtotal}`,
            shipping: `₹${orderData.totals.shipping}`,
            tax: `₹${orderData.totals.tax}`,
            grand_total: `₹${orderData.totals.grandTotal}`,
            shipping_address: shippingAddressText,
            payment_method: orderData.paymentMethod
        };
    }

    // Format order items for email display
    formatOrderItems(items) {
        if (!items || items.length === 0) {
            return 'No items found';
        }

        return items.map(item => {
            return `• ${item.name} (Size: ${item.size}, Qty: ${item.quantity}) - ₹${item.price * item.quantity}`;
        }).join('\n');
    }

    // Format shipping address for email display
    formatShippingAddress(address) {
        if (!address) {
            return 'No address provided';
        }

        let addressText = `${address.fullName || 'N/A'}\n`;
        addressText += `${address.address1 || ''}\n`;
        if (address.address2) {
            addressText += `${address.address2}\n`;
        }
        addressText += `${address.city || ''}, ${address.state || ''} ${address.pincode || ''}\n`;
        addressText += `Phone: ${address.phone || 'N/A'}\n`;
        addressText += `Email: ${address.email || 'N/A'}`;
        
        if (address.specialInstructions) {
            addressText += `\n\nSpecial Instructions: ${address.specialInstructions}`;
        }

        return addressText;
    }

    // Event trigger for order_confirmed
    async onOrderConfirmed(orderData) {
        console.log('Order confirmed event triggered, sending email...');
        return await this.handleOrderConfirmationEmail(orderData);
    }
}

// Create global instance
const emailService = new EmailService();

// Global function for backward compatibility
async function handleOrderConfirmationEmail(orderData) {
    return await emailService.handleOrderConfirmationEmail(orderData);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
