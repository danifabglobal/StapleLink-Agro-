import React, { useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabase } from './supabase'
import {
  LayoutDashboard, Sprout, ShoppingCart, Truck, Users, Plus, Search,
  Menu, X, Wheat, Leaf, MapPin, CalendarDays, PackageCheck, ArrowUpRight,
  ClipboardList, CheckCircle2, Clock3, CircleAlert, RefreshCw
} from 'lucide-react'

const initialFarmers = [
  { id:'f1', name:'Chinedu Okafor', phone:'0803 000 1122', community:'Adani', crop:'Rice', status:'Verified' },
  { id:'f2', name:'Ngozi Eze', phone:'0806 000 3344', community:'Eziani', crop:'Tomato', status:'Pending' },
  { id:'f3', name:'Emeka Nwafor', phone:'0810 000 5566', community:'Lejja', crop:'Tomato', status:'Verified' }
]
const initialHarvests = [
  { id:'h1', farmer_name:'Chinedu Okafor', crop:'Rice', community:'Adani', quantity_kg:2500, harvest_date:'2026-11-22', status:'Available' },
  { id:'h2', farmer_name:'Ngozi Eze', crop:'Tomato', community:'Eziani', quantity_kg:850, harvest_date:'2026-11-18', status:'Available' },
  { id:'h3', farmer_name:'Emeka Nwafor', crop:'Tomato', community:'Lejja', quantity_kg:1200, harvest_date:'2026-11-25', status:'Matching' }
]
const initialRequests = [
  { id:'b1', buyer_name:'Nsukka Fresh Mart', crop:'Tomato', quantity_kg:1000, delivery_location:'Nsukka town', needed_by:'2026-11-20', status:'Open' },
  { id:'b2', buyer_name:'Eastern Grains Ltd', crop:'Rice', quantity_kg:2000, delivery_location:'Enugu', needed_by:'2026-11-28', status:'Matched' }
]
const initialDeliveries = [
  { id:'d1', produce:'Rice', quantity_kg:1200, origin:'Adani', destination:'Nsukka town', transporter:'Demo Logistics', status:'Scheduled' }
]
const keyMap = { farmers:'staplelink_farmers', harvests:'staplelink_harvests', requests:'staplelink_requests', deliveries:'staplelink_deliveries' }
const seedMap = { farmers:initialFarmers, harvests:initialHarvests, requests:initialRequests, deliveries:initialDeliveries }
const tables = { farmers:'farmers', harvests:'harvest_listings', requests:'buyer_requests', deliveries:'deliveries' }

function readLocal(kind) {
  try {
    const v = localStorage.getItem(keyMap[kind])
    if (v) return JSON.parse(v)
    localStorage.setItem(keyMap[kind], JSON.stringify(seedMap[kind]))
  } catch {}
  return seedMap[kind]
}
function saveLocal(kind, rows) {
  localStorage.setItem(keyMap[kind], JSON.stringify(rows))
}
function money(n) { return new Intl.NumberFormat('en-NG').format(n || 0) }
function today() { return new Date().toISOString().slice(0,10) }

export default function App() {
  const [page, setPage] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [farmers, setFarmers] = useState([])
  const [harvests, setHarvests] = useState([])
  const [requests, setRequests] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [modal, setModal] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadAll() {
    if (hasSupabase) {
      const results = await Promise.all(Object.keys(tables).map(k => supabase.from(tables[k]).select('*').order('created_at', {ascending:false})))
      const setters = [setFarmers,setHarvests,setRequests,setDeliveries]
      results.forEach((r,i) => { if (!r.error) setters[i](r.data || []); else console.error(r.error) })
    } else {
      setFarmers(readLocal('farmers')); setHarvests(readLocal('harvests'))
      setRequests(readLocal('requests')); setDeliveries(readLocal('deliveries'))
    }
  }
  useEffect(() => { loadAll() }, [])

  async function addRecord(kind, record) {
    setBusy(true)
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
    const row = { id, ...record }
    if (hasSupabase) {
      const { error } = await supabase.from(tables[kind]).insert(row)
      if (error) { setNotice('Could not save record: ' + error.message); setBusy(false); return }
    } else {
      const setter = {farmers:setFarmers,harvests:setHarvests,requests:setRequests,deliveries:setDeliveries}[kind]
      const current = {farmers,harvests,requests,deliveries}[kind]
      const next = [row, ...current]
      setter(next); saveLocal(kind,next)
    }
    if (hasSupabase) await loadAll()
    setBusy(false); setModal(''); setNotice('Record saved successfully.')
  }

  async function updateStatus(kind, id, status) {
    if (hasSupabase) {
      const { error } = await supabase.from(tables[kind]).update({status}).eq('id',id)
      if (error) { setNotice(error.message); return }
      await loadAll()
    } else {
      const setter = {farmers:setFarmers,harvests:setHarvests,requests:setRequests,deliveries:setDeliveries}[kind]
      const current = {farmers,harvests,requests,deliveries}[kind]
      const next = current.map(r => r.id === id ? {...r,status} : r)
      setter(next); saveLocal(kind,next)
    }
  }

  const nav = [
    ['Overview',LayoutDashboard],['Farmers',Users],['Harvest listings',Sprout],
    ['Buyer requests',ShoppingCart],['Logistics',Truck]
  ]
  const filtered = (rows, fields) => rows.filter(r => fields.some(f => String(r[f] || '').toLowerCase().includes(search.toLowerCase())))
  const totalSupply = harvests.reduce((a,r)=>a+Number(r.quantity_kg||0),0)
  const totalDemand = requests.reduce((a,r)=>a+Number(r.quantity_kg||0),0)

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="brand"><div className="brand-mark"><Wheat size={25}/></div><div><b>STAPLE<span>LINK</span></b><small>AGRO • CONNECT. AGGREGATE. DELIVER.</small></div><button className="close-nav" onClick={()=>setMobileOpen(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(([label,Icon])=><button key={label} className={page===label?'nav-item active':'nav-item'} onClick={()=>{setPage(label);setMobileOpen(false);setSearch('')}}><Icon size={18}/><span>{label}</span>{label==='Harvest listings'&&<span className="nav-count">{harvests.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="pilot-card"><div className="pilot-icon"><MapPin size={17}/></div><div><b>Nsukka Pilot</b><span>Enugu State, Nigeria</span></div></div><div className="user-mini"><div className="avatar">SA</div><div><b>STAPLELINK Admin</b><span>Workspace administrator</span></div></div></div>
    </aside>
    {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)} />}
    <main className="main">
      <header className="topbar"><button className="menu-btn" onClick={()=>setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><span className={hasSupabase?'connection cloud':'connection local'}><i/>{hasSupabase?'Cloud database':'Demo mode'}</span><div className="avatar">SA</div></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">STAPLELINK AGRO • HARVEST-TO-MARKET NETWORK</div><h1>{page==='Overview'?'Good morning, team.':page}</h1><p>{page==='Overview'?'Coordinate harvests, connect demand and move produce to market.':page==='Farmers'?'Manage farmer profiles and community relationships.':page==='Harvest listings'?'Track expected produce, harvest dates and available quantities.':page==='Buyer requests'?'Capture buyer demand and identify matching supply.':'Coordinate collection, transport and delivery records.'}</p></div><button className="primary-btn" onClick={()=>setModal(page==='Farmers'?'farmer':page==='Harvest listings'?'harvest':page==='Buyer requests'?'request':page==='Logistics'?'delivery':'harvest')}><Plus size={17}/> {page==='Farmers'?'Add farmer':page==='Buyer requests'?'Add buyer request':page==='Logistics'?'New delivery':'Add harvest'}</button></div>

        {notice&&<div className="notice"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice('')}>×</button></div>}

        {page==='Overview'&&<>
          <div className="stats-grid">
            <Stat icon={Users} label="Registered farmers" value={farmers.length} note="Across pilot communities" />
            <Stat icon={Wheat} label="Expected produce" value={`${money(totalSupply)} kg`} note="Listed harvest volume" />
            <Stat icon={ShoppingCart} label="Buyer demand" value={`${money(totalDemand)} kg`} note="Requested quantities" />
            <Stat icon={Truck} label="Deliveries tracked" value={deliveries.length} note="Scheduled and completed" />
          </div>
          <div className="overview-grid">
            <section className="panel"><div className="panel-head"><div><h3>Recent harvest listings</h3><p>Expected supply from pilot communities</p></div><button className="text-btn" onClick={()=>setPage('Harvest listings')}>View all <ArrowUpRight size={15}/></button></div><HarvestTable rows={harvests.slice(0,4)} onStatus={updateStatus}/></section>
            <section className="panel"><div className="panel-head"><div><h3>Buyer demand</h3><p>Produce requirements from buyers</p></div><button className="text-btn" onClick={()=>setPage('Buyer requests')}>View all <ArrowUpRight size={15}/></button></div><RequestList rows={requests.slice(0,4)}/></section>
          </div>
          <section className="panel workflow-panel"><div className="panel-head"><div><h3>How STAPLELINK works</h3><p>A coordinated route from expected harvest to buyer delivery</p></div><span className="tag">CORE WORKFLOW</span></div><div className="workflow">{[['01','Register','Capture farmer, crop, location and expected harvest.'],['02','Match','Compare expected supply with buyer requirements.'],['03','Aggregate','Coordinate harvest, quality checks and weighing.'],['04','Deliver','Arrange transport and record buyer receipt.']].map(([n,t,d],i)=><div className="workflow-step" key={n}><div className="step-no">{n}</div><b>{t}</b><p>{d}</p>{i<3&&<div className="step-line"/>}</div>)}</div></section>
        </>}

        {page==='Farmers'&&<section className="panel"><PanelToolbar count={farmers.length} search={search} setSearch={setSearch} label="farmers"/><div className="table-wrap"><table><thead><tr><th>FARMER</th><th>PHONE</th><th>COMMUNITY</th><th>PRIMARY CROP</th><th>STATUS</th></tr></thead><tbody>{filtered(farmers,['name','phone','community','crop']).map(r=><tr key={r.id}><td><b>{r.name}</b></td><td>{r.phone}</td><td><MapPin size={13}/> {r.community}</td><td><span className="crop-pill">{r.crop}</span></td><td><Status value={r.status}/></td></tr>)}</tbody></table>{!farmers.length&&<Empty/>}</div></section>}

        {page==='Harvest listings'&&<section className="panel"><PanelToolbar count={harvests.length} search={search} setSearch={setSearch} label="harvest listings"/><HarvestTable rows={filtered(harvests,['farmer_name','crop','community','status'])} onStatus={updateStatus} full/></section>}

        {page==='Buyer requests'&&<section className="panel"><PanelToolbar count={requests.length} search={search} setSearch={setSearch} label="buyer requests"/><div className="table-wrap"><table><thead><tr><th>BUYER</th><th>CROP</th><th>QUANTITY</th><th>DELIVERY LOCATION</th><th>NEEDED BY</th><th>STATUS</th></tr></thead><tbody>{filtered(requests,['buyer_name','crop','delivery_location','status']).map(r=><tr key={r.id}><td><b>{r.buyer_name}</b></td><td><span className="crop-pill">{r.crop}</span></td><td>{money(r.quantity_kg)} kg</td><td>{r.delivery_location}</td><td>{r.needed_by}</td><td><Status value={r.status}/></td></tr>)}</tbody></table>{!requests.length&&<Empty/>}</div></section>}

        {page==='Logistics'&&<section className="panel"><PanelToolbar count={deliveries.length} search={search} setSearch={setSearch} label="delivery records"/><div className="table-wrap"><table><thead><tr><th>PRODUCE</th><th>QUANTITY</th><th>ORIGIN</th><th>DESTINATION</th><th>TRANSPORTER</th><th>STATUS</th></tr></thead><tbody>{filtered(deliveries,['produce','origin','destination','transporter','status']).map(r=><tr key={r.id}><td><b>{r.produce}</b></td><td>{money(r.quantity_kg)} kg</td><td>{r.origin}</td><td>{r.destination}</td><td>{r.transporter}</td><td><select className="status-select" value={r.status} onChange={e=>updateStatus('deliveries',r.id,e.target.value)}><option>Scheduled</option><option>Collected</option><option>In transit</option><option>Delivered</option><option>Cancelled</option></select></td></tr>)}</tbody></table>{!deliveries.length&&<Empty/>}</div></section>}
        <footer>© 2026 STAPLELINK Agro <span>Connect • Aggregate • Deliver</span><button onClick={loadAll}><RefreshCw size={13}/> Refresh data</button></footer>
      </div>
    </main>
    {modal&&<Modal type={modal} onClose={()=>setModal('')} onSave={addRecord} busy={busy}/>}
  </div>
}

function Stat({icon:Icon,label,value,note}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={19}/></div></div><strong>{value}</strong><small>{note}</small></div> }
function PanelToolbar({count,search,setSearch,label}) { return <div className="toolbar"><div><b>{count} {label}</b><span>Records in your workspace</span></div><div className="searchbox"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records..."/></div></div> }
function Status({value}) { const cls=String(value).toLowerCase().replaceAll(' ','-'); return <span className={`status ${cls}`}>{value}</span> }
function Empty() { return <div className="empty">No records found. Add your first record to get started.</div> }
function HarvestTable({rows,onStatus,full=false}) { return <div className="table-wrap"><table><thead><tr><th>FARMER / PRODUCE</th><th>COMMUNITY</th><th>QUANTITY</th><th>EXPECTED HARVEST</th><th>STATUS</th>{full&&<th>ACTION</th>}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.farmer_name}</b><small className="subcell">{r.crop}</small></td><td><MapPin size={13}/> {r.community}</td><td><b>{money(r.quantity_kg)} kg</b></td><td>{r.harvest_date}</td><td><Status value={r.status}/></td>{full&&<td><select className="status-select" value={r.status} onChange={e=>onStatus('harvests',r.id,e.target.value)}><option>Available</option><option>Matching</option><option>Aggregating</option><option>Collected</option><option>Fulfilled</option></select></td>}</tr>)}</tbody></table>{!rows.length&&<Empty/>}</div> }
function RequestList({rows}) { return <div className="request-list">{rows.map(r=><div className="request-item" key={r.id}><div className="request-icon"><ShoppingCart size={17}/></div><div className="request-main"><b>{r.buyer_name}</b><span>{r.crop} · {money(r.quantity_kg)} kg</span><small>{r.delivery_location} · Needed {r.needed_by}</small></div><Status value={r.status}/></div>)}{!rows.length&&<Empty/>}</div> }
function Modal({type,onClose,onSave,busy}) {
  const configs = {
    farmer:{title:'Register a farmer',kind:'farmers',fields:[['name','Farmer name','text'],['phone','Phone number','tel'],['community','Community','text'],['crop','Primary crop','select',['Rice','Tomato']],['status','Verification status','select',['Pending','Verified']]]},
    harvest:{title:'Add expected harvest',kind:'harvests',fields:[['farmer_name','Farmer name','text'],['crop','Crop','select',['Rice','Tomato']],['community','Community','select',['Adani','Eziani','Lejja','Other Nsukka community']],['quantity_kg','Expected quantity (kg)','number'],['harvest_date','Expected harvest date','date'],['status','Listing status','select',['Available','Matching']]]},
    request:{title:'Add buyer request',kind:'requests',fields:[['buyer_name','Buyer / organisation','text'],['crop','Required crop','select',['Rice','Tomato']],['quantity_kg','Required quantity (kg)','number'],['delivery_location','Delivery location','text'],['needed_by','Required by','date'],['status','Request status','select',['Open','Matching','Matched']]]},
    delivery:{title:'Create delivery record',kind:'deliveries',fields:[['produce','Produce','select',['Rice','Tomato']],['quantity_kg','Quantity (kg)','number'],['origin','Collection point / origin','text'],['destination','Delivery destination','text'],['transporter','Transporter / logistics partner','text'],['status','Delivery status','select',['Scheduled','Collected','In transit','Delivered']]]}
  }
  const c=configs[type], [form,setForm]=useState({})
  function submit(e){e.preventDefault();const record={...form}; c.fields.forEach(([k,,t])=>{if(t==='number')record[k]=Number(record[k]||0)});onSave(c.kind,record)}
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">STAPLELINK WORKSPACE</span><h2>{c.title}</h2></div><button onClick={onClose}><X/></button></div><form onSubmit={submit}><div className="form-grid">{c.fields.map(([key,label,type,options])=><label key={key}>{label}{type==='select'?<select required value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="">Select...</option>{options.map(o=><option key={o}>{o}</option>)}</select>:<input required type={type} min={type==='number'?'1':undefined} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label}/>}</label>)}</div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button disabled={busy} className="primary-btn" type="submit">{busy?'Saving...':'Save record'}</button></div></form></div></div>
}
