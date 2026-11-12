import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import assert from 'node:assert/strict';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
 const { validateBooking, checkAvailability } = await server.ssrLoadModule('/src/bookingLogic.ts');
 const { SAMPLE_ROOMS, SAMPLE_BOOKINGS } = await server.ssrLoadModule('/src/sampleData.ts');
 const { BookingPanel } = await server.ssrLoadModule('/src/components/BookingPanel.tsx');
 const room = SAMPLE_ROOMS.find(r => r.name === 'A-102');
 const bookings = SAMPLE_BOOKINGS.map(b => Object.freeze({...b})); Object.freeze(bookings);
 const before = JSON.stringify(bookings);
 for(const [start,end,expected] of [[660,720,'available'],[570,600,'available'],[630,690,'unavailable']]) {
  assert.equal(checkAvailability(start,end,room,bookings,540),expected);
  console.log(JSON.stringify({check:'overlap and endpoint',start,end,expected,actual:checkAvailability(start,end,room,bookings,540)}));
 }
 assert.equal(JSON.stringify(bookings),before); console.log('PASS frozen sample booking values unchanged');
 const payload = '<script>window.__practice10_xss=1</script>';
 const synthetic = [{id:'probe',roomName:'A-102',start:600,end:660,bookedBy:payload}];
 const html = renderToStaticMarkup(React.createElement(BookingPanel,{room,bookings:synthetic,currentMinutes:540,startTime:'10:30',endTime:'11:30',onStartTimeChange(){},onEndTimeChange(){},onBlockedChange(){}}));
 assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>'));
 console.log('PASS synthetic fixture markup escaped by real BookingPanel render; no raw script element');
 console.log(JSON.stringify({check:'out-of-day supplied clock diagnostic',currentMinutes:-1,actual:validateBooking(660,720,room,bookings,-1),scope:'UI clamps its clock; helper day-range policy for external callers is not specified'}));
} finally { await server.close(); }
