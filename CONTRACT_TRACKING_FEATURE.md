# Contract Tracking Feature

## ✅ What Was Implemented

### New Screen: Contract Tracking (`contract-tracking.tsx`)

A vertical timeline UI showing the current state of a contract/transaction through the escrow process.

#### Timeline States

| Step | Status | Title | Description |
|------|--------|-------|-------------|
| 1 | AWAITING_PAYMENT | Creado | El vendedor ha listado el producto |
| 2 | LOCKED | Pagado | Tu pago está seguro en Vault |
| 3 | IN_TRANSIT | Enviado | El vendedor ha despachado el producto |
| 4 | RELEASED | Recibido | Confirma que el producto está de acuerdo con el contrato |
| 5 | COMPLETED | Fondos liberados | El pago se enviará al vendedor |

#### Visual States

- **Completed Step**: ✅ Green checkmark icon, bold text, green connector line
- **Active Step**: 🔵 Blue numbered circle, bold text
- **Pending Step**: ⚪ Gray numbered circle, gray text

#### Actions

1. **Confirmar Recepción** (Primary Button)
   - Visible when status is `LOCKED` or `IN_TRANSIT`
   - Action: Release funds to seller (moves to RELEASED status)
   - Shows confirmation dialog

2. **Reportar un problema** (Destructive Button)
   - Visible for all statuses except `COMPLETED`, `REFUNDED`, and `DRAFT`
   - Action: Open dispute (moves to DISPUTED status)
   - Shows confirmation dialog

### Updated Screen: Product Details

Added tracking functionality to the product details screen:

#### New Features

1. **Tracking Card** (in content area)
   - Shows "Seguimiento del Contrato" with description
   - Clickable card navigates to tracking screen
   - Only visible if user is involved (seller or buyer) and status is not DRAFT

2. **Tracking Button** (in bottom action bar)
   - Added alongside "Realizar pago" button
   - Only visible if user is involved and status is not DRAFT
   - Quick access to tracking screen

#### Visibility Logic

```typescript
const isUserInvolved = user && (
  contract.seller.id === user.id || 
  (contract.buyer && contract.buyer.id === user.id)
);

const showTrackingButton = isUserInvolved && contract.status !== 'DRAFT';
```

## 📱 User Flow

### Buyer Flow

1. **View Product** → Scan QR or enter code
2. **Product Details** → See "Seguimiento" button/card
3. **Tap Seguimiento** → Navigate to tracking screen
4. **View Timeline** → See current status (e.g., "Pagado" - step 2 active)
5. **Confirm Receipt** → Tap "Confirmar Recepción" when product arrives
6. **Funds Released** → Timeline shows "Fondos liberados" completed

### Seller Flow

1. **Create Listing** → Contract in AWAITING_PAYMENT
2. **Buyer Pays** → Status moves to LOCKED
3. **View Tracking** → See "Pagado" step active
4. **Ship Product** → Status moves to IN_TRANSIT (manual or API)
5. **Buyer Confirms** → Status moves to RELEASED
6. **Receive Payment** → Status moves to COMPLETED

## 🎨 UI Components

### Timeline Step Component

```typescript
<TimelineStepItem
  step={step}
  state="completed" | "active" | "pending"
  isLast={boolean}
/>
```

**Features:**
- Icon: Checkmark (completed) or numbered circle (active/pending)
- Connector line between steps
- Title and description text
- Dynamic styling based on state

### Contract Info Header

Shows:
- Contract title
- Access code (badge)
- Price

### Action Buttons

- Primary: "Confirmar Recepción" (dark background)
- Destructive: "Reportar un problema" (red background)
- Conditional rendering based on contract status

## 🔧 Technical Details

### Navigation

```typescript
// From product details
router.push(`/contract-tracking?contractId=${contract.id}`)

// From tracking screen
router.back() // Returns to previous screen
```

### State Management

```typescript
const getStepState = (step: TimelineStep, currentStatus: string) => {
  const statusOrder = ['DRAFT', 'AWAITING_PAYMENT', 'LOCKED', 'IN_TRANSIT', 'RELEASED', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(step.status);

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
};
```

### API Integration

- Fetches contract details using `contractsService.getContract()`
- Requires authentication token
- Shows loading and error states

## 🎯 Features

✅ **Visual Timeline**: Clear progression through escrow stages
✅ **Status Indicators**: Color-coded steps (green, blue, gray)
✅ **Conditional Actions**: Buttons appear based on current status
✅ **User Role Awareness**: Only shows for involved parties
✅ **Confirmation Dialogs**: Prevents accidental actions
✅ **Responsive Design**: Works on all screen sizes
✅ **Loading States**: Smooth loading indicators
✅ **Error Handling**: Graceful error messages
✅ **Navigation**: Easy access from product details

## 🔜 Future Enhancements

- [ ] Real-time status updates (WebSocket/polling)
- [ ] Push notifications on status changes
- [ ] Estimated delivery dates
- [ ] Shipping tracking integration
- [ ] Photo upload for proof of delivery
- [ ] Chat between buyer and seller
- [ ] Dispute resolution workflow
- [ ] Rating/review after completion
- [ ] Transaction history/receipts
- [ ] Refund process UI

## 📋 Files Created/Modified

### New Files
- `frontend/app/contract-tracking.tsx` - Main tracking screen

### Modified Files
- `frontend/app/product/[productId].tsx` - Added tracking button and card

## 🧪 Testing Checklist

- [ ] Timeline displays correctly for each status
- [ ] Completed steps show green checkmark
- [ ] Active step shows blue numbered circle
- [ ] Pending steps show gray numbered circle
- [ ] Connector lines have correct colors
- [ ] "Confirmar Recepción" button shows for LOCKED/IN_TRANSIT
- [ ] "Reportar un problema" button shows for valid statuses
- [ ] Confirmation dialogs work correctly
- [ ] Navigation from product details works
- [ ] Tracking button only shows for involved users
- [ ] Tracking button hides for DRAFT status
- [ ] Loading state displays correctly
- [ ] Error state displays correctly
- [ ] Back button returns to previous screen

## 🎨 Design Reference

The UI follows the "Estado del Vault" design with:
- Clean vertical timeline
- Clear visual hierarchy
- Action buttons at bottom
- Informative descriptions
- Professional color scheme (green for success, blue for active, gray for pending)

## 💡 Usage Examples

### Access Tracking Screen

```typescript
// From product details
<Button onPress={() => router.push(`/contract-tracking?contractId=${id}`)}>
  Seguimiento
</Button>

// From transaction list
<TransactionCard onPress={() => router.push(`/contract-tracking?contractId=${id}`)} />
```

### Check User Involvement

```typescript
const isUserInvolved = user && (
  contract.seller.id === user.id || 
  (contract.buyer && contract.buyer.id === user.id)
);
```

### Determine Button Visibility

```typescript
const canReleaseFunds = contract.status === 'IN_TRANSIT' || contract.status === 'LOCKED';
const canReportProblem = !['COMPLETED', 'REFUNDED', 'DRAFT'].includes(contract.status);
```