import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  fmtMoney, fmtDate, fmtDateShort,
  calcInvoiceTotal, calcInvoiceSubtotal, calcPaid,
  calcLaborTotal, calcPartsTotal, calcTax,
} from '../utils/format';

// Wheel SVG logo matching the screenshot
function WheelLogo() {
  const spokes = [0, 60, 120, 180, 240, 300];
  const cx = 44, cy = 44, r = 40;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#111" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={26} fill="none" stroke="#111" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={7} fill="#111" />
      {spokes.map(deg => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx + 9 * Math.cos(rad)} y1={cy + 9 * Math.sin(rad)}
            x2={cx + 25 * Math.cos(rad)} y2={cy + 25 * Math.sin(rad)}
            stroke="#111" strokeWidth="2"
          />
        );
      })}
      {/* Tread dots */}
      {[15, 75, 135, 195, 255, 315].map(deg => {
        const rad = (deg * Math.PI) / 180;
        return <circle key={deg} cx={cx + 35 * Math.cos(rad)} cy={cy + 35 * Math.sin(rad)} r="2.5" fill="#111" />;
      })}
    </svg>
  );
}

export default function InvoicePrint() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { invoices, clients } = useApp();
  const navigate = useNavigate();

  const invoice = invoices.find(i => i.id === invoiceId);
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null;

  if (!invoice || !client) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Invoice not found.</p>
      <button onClick={() => navigate('/invoices')} className="text-blue-600 hover:underline mt-2 text-sm">← Back</button>
    </div>
  );

  const v = client.vehicle;
  const sub = calcInvoiceSubtotal(invoice);
  const tax = calcTax(sub);
  const total = sub + tax;
  const paid = calcPaid(invoice.payments);
  const balance = Math.max(0, total - paid);
  const laborTotal = calcLaborTotal(invoice.lineItems);
  const partsTotal = calcPartsTotal(invoice.lineItems);

  const now = new Date();
  const createdStr = fmtDateShort(invoice.date);

  // ── Print styles ──────────────────────────────────────────────────────────
  const S = {
    page: {
      width: '8.5in',
      minHeight: '11in',
      margin: '0 auto',
      padding: '0.4in 0.45in',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '9px',
      color: '#111',
      background: 'white',
      boxSizing: 'border-box' as const,
    },
    section: { marginBottom: '8px' },
    hr: { borderTop: '1px solid #888', margin: '8px 0' },
    hrThick: { borderTop: '2px solid #111', margin: '6px 0' },
    label: { fontWeight: 700, fontSize: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
    cell: { padding: '3px 5px', verticalAlign: 'top' as const },
    th: { padding: '4px 5px', textAlign: 'left' as const, fontWeight: 700, borderBottom: '1.5px solid #111', fontSize: '8.5px' },
    td: { padding: '3px 5px', borderBottom: '0.5px solid #ccc', fontSize: '9px' },
  };

  return (
    <div>
      {/* Screen-only controls */}
      <div className="print:hidden flex items-center gap-3 px-6 py-4 bg-gray-100 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">← Back</button>
        <span className="text-sm text-gray-500 font-medium">Print Preview — {invoice.id}</span>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          🖨 Print Invoice
        </button>
      </div>

      {/* Print area — this is what gets printed */}
      <div id="print-root">

        {/* ════════════════════════════════════════════════════════
            PAGE 1
            ════════════════════════════════════════════════════════ */}
        <div style={{ ...S.page, pageBreakAfter: 'always' }}>

          {/* ── HEADER ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <tbody>
              <tr>
                {/* LEFT: Shop Info */}
                <td style={{ width: '38%', verticalAlign: 'top', paddingRight: '8px' }}>
                  <div style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '0.01em' }}>Prince Auto Repair MV112559</div>
                  <div style={{ marginTop: '3px', lineHeight: '1.6', fontSize: '8.5px', color: '#222' }}>
                    54 SW 9th Street<br />
                    Deerfield Beach, FL 33441<br />
                    Ph: (954) 421-7117<br />
                    service@princeautorepairs.com<br />
                    Princeautorepairs.com
                  </div>
                </td>
                {/* CENTER: Logo */}
                <td style={{ width: '24%', textAlign: 'center', verticalAlign: 'middle' }}>
                  <WheelLogo />
                </td>
                {/* RIGHT: Invoice Meta */}
                <td style={{ width: '38%', verticalAlign: 'top', textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '15px', marginBottom: '4px' }}>Invoice #{invoice.id.replace('INV-2025-', '67')}</div>
                  <div style={{ lineHeight: '1.7', fontSize: '8.5px' }}>
                    <div>Service Writer: {invoice.serviceWriter || 'Lucy'}</div>
                    <div>Technician: {invoice.technician || 'John'}</div>
                    <div>Created: {createdStr}</div>
                    {invoice.closedDate && <div>Closed: {fmtDateShort(invoice.closedDate)}</div>}
                    {invoice.dueDate && <div>Due: {fmtDateShort(invoice.dueDate)}</div>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={S.hrThick} />

          {/* ── CUSTOMER + VEHICLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <tbody>
              <tr>
                {/* Customer */}
                <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '16px' }}>
                  <div style={{ fontWeight: 900, fontSize: '10px', marginBottom: '3px' }}>{client.name} <span style={{ fontWeight: 400, fontSize: '8.5px' }}>(Authorize)</span></div>
                  <div style={{ lineHeight: '1.6', fontSize: '8.5px' }}>
                    <div>{client.address}</div>
                    <div>{client.city}, {client.state} {client.zip}</div>
                    <div>M: {client.phone}</div>
                    {client.authContact && <div style={{ marginTop: '4px' }}>{client.authContact} (Additional Auth.)</div>}
                    {client.authPhone && <div>{client.authPhone}</div>}
                  </div>
                </td>
                {/* Vehicle */}
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 900, fontSize: '10px', marginBottom: '3px' }}>
                    {v.year} {v.make} {v.model}
                  </div>
                  <div style={{ lineHeight: '1.6', fontSize: '8.5px' }}>
                    <div>{v.engine} · VIN: <span style={{ fontFamily: 'monospace' }}>{v.vin}</span></div>
                    {v.serviceTag && <div>Service Tag: {v.serviceTag}</div>}
                    <div>Mileage In: {v.mileageIn?.toLocaleString()}{v.mileageOut ? ` | Out: ${v.mileageOut.toLocaleString()}` : ''}</div>
                    <div>Tire Size: {v.tireSize}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={S.hr} />

          {/* ── LABOR CHARGES BASIS ── */}
          <div style={{ fontSize: '8.5px', marginBottom: '4px' }}>
            <strong>LABOR CHARGES BASED ON:</strong>&nbsp;&nbsp;
            FLAT RATE ___&nbsp;&nbsp; HOURLY RATE ___&nbsp;&nbsp; BOTH APPLY _X_
          </div>
          <div style={{ fontSize: '8px', marginBottom: '4px' }}>
            ESTIMATE DIAGNOSTIC FEE: ________ OR HOURLY AT ________
          </div>
          <div style={{ fontSize: '7.5px', marginBottom: '8px', color: '#444' }}>
            * U-Used &nbsp;R-Rebuilt &nbsp;RC-Reconditioned &nbsp;NCho-Chg/Warranty &nbsp;R/D-Reduced
          </div>

          <div style={S.hrThick} />

          {/* ── LINE ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #111' }}>
                <th style={{ ...S.th, width: '7%' }}>ITEM</th>
                <th style={{ ...S.th, width: '40%' }}>DESCRIPTION</th>
                <th style={{ ...S.th, width: '13%' }}>PART #</th>
                <th style={{ ...S.th, width: '10%', textAlign: 'right' }}>QTY/HRS</th>
                <th style={{ ...S.th, width: '15%', textAlign: 'right' }}>RATE/PRICE</th>
                <th style={{ ...S.th, width: '15%', textAlign: 'right' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={S.td}>{li.type}</td>
                  <td style={S.td}>{li.desc}</td>
                  <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '8px' }}>{li.partNumber || ''}</td>
                  <td style={{ ...S.td, textAlign: 'right' }}>{li.qty}</td>
                  <td style={{ ...S.td, textAlign: 'right' }}>{fmtMoney(li.unit)}</td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>{fmtMoney(li.qty * li.unit)}</td>
                </tr>
              ))}
              {/* Shop Supplies + HazMat as line items */}
              {invoice.shopSupplies > 0 && (
                <tr style={{ background: '#fafafa' }}>
                  <td style={S.td}>Fee</td>
                  <td style={{ ...S.td, fontStyle: 'italic' }}>Shop Supplies **</td>
                  <td style={S.td} /><td style={S.td} /><td style={S.td} />
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>{fmtMoney(invoice.shopSupplies)}</td>
                </tr>
              )}
              {invoice.hazmat > 0 && (
                <tr>
                  <td style={S.td}>Fee</td>
                  <td style={{ ...S.td, fontStyle: 'italic' }}>HazMat Disposal</td>
                  <td style={S.td} /><td style={S.td} /><td style={S.td} />
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>{fmtMoney(invoice.hazmat)}</td>
                </tr>
              )}
              {/* Filler rows */}
              {Array.from({ length: Math.max(0, 8 - invoice.lineItems.length) }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ height: '20px' }}>
                  <td style={{ ...S.td, color: 'transparent' }}>·</td>
                  <td style={S.td} /><td style={S.td} /><td style={S.td} /><td style={S.td} /><td style={S.td} />
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ fontSize: '8.5px', marginBottom: '8px', padding: '6px 8px', border: '0.5px solid #ccc', borderRadius: '3px' }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════
            PAGE 2
            ════════════════════════════════════════════════════════ */}
        <div style={S.page}>

          <div style={S.hr} />

          {/* ── TERMS PARAGRAPH ── */}
          <div style={{ fontSize: '8.5px', lineHeight: '1.55', marginBottom: '10px', textAlign: 'justify' }}>
            Your vehicle is being returned to you in exchange for your payment of the amount due. An express mechanics lien is hereby acknowledged on my vehicle to secure the amount of repairs thereto. We accept cash, approved checks and credit cards as methods of payment. Payment is expected on completion of repairs. If I select a credit card as the method of payment, I agree to pay, comply and not dispute this invoice by putting in a stop payment on the credit card. Parts and labor are non-refundable. 12 month / 6,000 mile warranty, whichever comes first, on all parts and labor unless otherwise specified. No warranty on customer parts, used parts or refurbished parts. By signing below I acknowledge that I have received the above itemized goods, services or repairs in this invoice and that I have received or had the opportunity to inspect any replaced parts as requested by me.
          </div>

          {/* ── SIGNATURE LINE ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '9px', marginBottom: '2px' }}>SIGNATURE</div>
              <div style={{ borderBottom: '1.5px solid #111', height: '20px', marginRight: '12px' }} />
            </div>
            <div style={{ width: '140px' }}>
              <div style={{ fontWeight: 700, fontSize: '9px', marginBottom: '2px' }}>DATE</div>
              <div style={{ borderBottom: '1.5px solid #111', height: '20px' }} />
            </div>
          </div>

          <div style={S.hr} />

          {/* ── SAVE PARTS ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', fontSize: '9px' }}>
            <span style={{ fontWeight: 700 }}>Save Replacement parts for inspection or concern:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #555', marginRight: '3px' }} />Yes
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1px solid #555', marginRight: '3px' }} />No
            </span>
          </div>

          <div style={S.hr} />

          {/* ── FINE PRINT ── */}
          <div style={{ fontSize: '7.5px', lineHeight: '1.5', color: '#333', marginBottom: '10px' }}>
            **This charge represents costs and profits to the motor vehicle repair facility for miscellaneous shop supplies or waste disposal. ***FS403.718 mandates a $1.00 fee for each new tire sold in the State of Florida. ***FS403.7185 mandates a $1.50 fee for each new or re-manufactured battery sold in the State of Florida.<br />
            Not responsible for damage caused by theft, fire or acts of nature. I hereby authorize the above repairs, including sublet work, along with the necessary materials. You and your employees may operate my vehicle for the purpose of testing, inspection and delivery at my risk. If I cancel repairs prior to their completion for any reason, a tear down and reassembly fee of $__ will be applied.<br />
            12 months/6,000 miles warranty on all parts and labor unless otherwise specified. No warranty on parts brought in by customer. A storage fee of $180.00 per day may be applied for vehicles which are not claimed within 3 working days of notification of completion.
          </div>

          {/* ── AUTHORIZATION TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr>
                {['Authorizer', 'Date', 'Authorization Method', 'Shop Representative', 'Add. Amount', 'Total'].map(h => (
                  <th key={h} style={{ ...S.th, fontStyle: 'italic', fontWeight: 600, fontSize: '8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: '20px' }}>
                {Array.from({ length: 6 }).map((_, i) => <td key={i} style={{ ...S.td, borderBottom: '0.5px solid #ccc' }} />)}
              </tr>
            </tbody>
          </table>

          {/* ── PAYMENTS + TOTALS (two columns) ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
            <tbody>
              <tr style={{ verticalAlign: 'top' }}>
                {/* LEFT: Payment History */}
                <td style={{ width: '55%', paddingRight: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '9px', marginBottom: '4px' }}>Payments:</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', fontStyle: 'italic', fontWeight: 500, paddingBottom: '2px', borderBottom: '0.5px solid #888' }}>Date</th>
                        <th style={{ textAlign: 'left', fontStyle: 'italic', fontWeight: 500, paddingBottom: '2px', borderBottom: '0.5px solid #888' }}>Method</th>
                        <th style={{ textAlign: 'left', fontStyle: 'italic', fontWeight: 500, paddingBottom: '2px', borderBottom: '0.5px solid #888' }}>Reference #</th>
                        <th style={{ textAlign: 'right', fontStyle: 'italic', fontWeight: 500, paddingBottom: '2px', borderBottom: '0.5px solid #888' }}>Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.payments.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '4px 0', color: '#aaa', fontStyle: 'italic' }}>No payments recorded</td></tr>
                      ) : (
                        invoice.payments.map(p => (
                          <tr key={p.id}>
                            <td style={{ padding: '3px 0' }}>{fmtDateShort(p.date)}</td>
                            <td style={{ padding: '3px 0' }}>{p.method}</td>
                            <td style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: '7.5px' }}>{p.referenceNumber || ''}</td>
                            <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 600 }}>{fmtMoney(p.amount)}</td>
                          </tr>
                        ))
                      )}
                      {/* Total Payments row */}
                      <tr style={{ borderTop: '0.5px solid #888' }}>
                        <td colSpan={3} style={{ padding: '4px 0', fontStyle: 'italic', textAlign: 'right', paddingRight: '8px' }}>Total Payments</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>{fmtMoney(paid)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                {/* RIGHT: Totals Summary */}
                <td style={{ width: '45%', verticalAlign: 'top' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <tbody>
                      {[
                        ['Parts:', fmtMoney(partsTotal)],
                        ['Labor:', fmtMoney(laborTotal)],
                        ['Shop Supplies:', fmtMoney(invoice.shopSupplies)],
                        ['HazMat:', fmtMoney(invoice.hazmat)],
                        ['Subtotal:', fmtMoney(sub)],
                        ['Total Tax:', fmtMoney(tax)],
                      ].map(([l, v]) => (
                        <tr key={l}>
                          <td style={{ padding: '2px 6px', color: '#333' }}>{l}</td>
                          <td style={{ padding: '2px 6px', textAlign: 'right', fontWeight: 500 }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Boxed Invoice Total / Payments / Balance */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #111', marginTop: '4px', fontSize: '8.5px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '0.5px solid #ccc' }}>
                        <td style={{ padding: '3px 6px' }}>Invoice Total:</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{fmtMoney(total)}</td>
                      </tr>
                      <tr style={{ borderBottom: '0.5px solid #ccc' }}>
                        <td style={{ padding: '3px 6px', fontStyle: 'italic' }}>Payments</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontStyle: 'italic' }}>-{fmtMoney(paid)}</td>
                      </tr>
                      <tr style={{ background: balance > 0 ? 'white' : '#f0fdf4' }}>
                        <td style={{ padding: '4px 6px', fontWeight: 900, fontSize: '10px' }}>Balance:</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 900, fontSize: '10px' }}>{fmtMoney(balance)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── CUSTOMER SIGNATURE ── */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginTop: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontWeight: 900, fontSize: '11px' }}>X</span>
                <div style={{ flex: 1, borderBottom: '1px solid #111', height: '18px' }} />
              </div>
              <div style={{ fontSize: '8px', fontStyle: 'italic', marginTop: '2px', marginLeft: '16px' }}>Customer Signature</div>
            </div>
            <div style={{ width: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '9px', whiteSpace: 'nowrap' }}>Date</span>
                <span style={{ fontSize: '9px' }}>
                  {now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* ── PAGE FOOTER ── */}
          <div style={{ marginTop: '20px', borderTop: '0.5px solid #aaa', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#555' }}>
            <span><strong>Prince:</strong> MV112559</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
