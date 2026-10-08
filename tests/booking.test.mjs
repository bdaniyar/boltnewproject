import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/bookingLogic.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { validateBooking, checkAvailability, parseTime } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const room = Object.freeze({ name:'Test', building:'Campus', capacity:20, blocked:false });
const bookings = Object.freeze([Object.freeze({id:'test',roomName:'Test',start:600,end:660,bookedBy:'Test student'})]);
const cases = [
 ['1 Touching endpoints',660,720,room,bookings,true],
 ['2 Overlapping booking',630,690,room,bookings,false],
 ['3 Blocked room',660,720,{...room,blocked:true},[],false],
 ['4 Exactly 120 minutes',720,840,room,[],true],
 ['5 More than 120 minutes',720,841,room,[],false],
 ['6 Starts at current time',540,570,room,[],false],
];
for(const [name,start,end,r,b,expected] of cases) test(name,()=>{
 const before=JSON.stringify(b);
 const result=validateBooking(start,end,r,b,540);
 const status=checkAvailability(start,end,r,b,540);
 assert.equal(result.valid,expected);
 assert.equal(status, r.blocked?'blocked':expected?'available':'unavailable');
 assert.equal(JSON.stringify(b),before);
 if(!expected) assert.ok(result.messages.length);
 console.log(JSON.stringify({name,expected:expected?'Available':'Unavailable',actual:status,messages:result.messages}));
});
test('AC1 bounds, reversed range, past start and end at 1440',()=>{
 for(const [s,e] of [[-1,60],[720,1441],[720,720],[721,720],[539,570]]) assert.equal(validateBooking(s,e,room,[],540).valid,false);
 assert.equal(validateBooking(1320,1440,room,[],540).valid,true);
});
test('Other rooms do not conflict; touching before existing booking is allowed',()=>{
 assert.equal(validateBooking(550,600,room,bookings,540).valid,true);
 assert.equal(validateBooking(630,690,{...room,name:'Other'},bookings,540).valid,true);
});
test('Time parser rejects invalid and accepts 24:00',()=>{
 for(const value of ['', 'abc','24:01','12:60','-1:00']) assert.equal(parseTime(value),null);
 assert.equal(parseTime('24:00'),1440);
});
