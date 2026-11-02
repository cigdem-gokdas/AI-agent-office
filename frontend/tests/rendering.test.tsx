import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it,vi} from 'vitest';
vi.mock('../data/ownerBridge',()=>({useOwnerBridge:()=>({connected:true,busy:false,error:'',state:{inbox:[{id:'synthetic',text:'<img src=x onerror=alert(1)>',agent:'sample-worker',support:[],review:'routed',execution:'not_started'}],approvals:[],tasks:[]}})}));
import {OwnerRecords} from '../components/OwnerControls';
it('renders untrusted records as escaped text',()=>{const html=renderToStaticMarkup(<OwnerRecords kind="inbox"/>);expect(html).toContain('&lt;img');expect(html).not.toContain('<img src=x');});
