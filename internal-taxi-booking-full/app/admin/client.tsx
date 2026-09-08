'use client';
import {useMemo, useState} from 'react';

type Hotel = {id:string; name:string; address?:string|null; active:boolean};
type Vehicle = {id:string; vehicleName?:string|null; vehicleType:string; plateNumber:string; hotelId:string; hotel:{name:string}; active:boolean};
type Driver = {id:string; name:string; phone?:string|null; hotelId:string; hotel:{name:string}; active:boolean};
type User = {id:string; username:string; name:string; role:string; hotelId?:string|null; hotel?:{name:string}|null; driverId?:string|null; driver?:{name:string}|null; active:boolean};
type Log = {id:string; action:string; oldValue?:string|null; newValue?:string|null; notes?:string|null; createdAt:string|Date; user:{name:string}};

type Props = {role:string; hotels:Hotel[]; vehicles:Vehicle[]; drivers:Driver[]; users:User[]; logs:Log[]};

export default function AdminClient({role,hotels:initialHotels,vehicles:initialVehicles,drivers:initialDrivers,users:initialUsers,logs}:Props){
  const [hotels,setHotels]=useState(initialHotels); const [vehicles,setVehicles]=useState(initialVehicles); const [drivers,setDrivers]=useState(initialDrivers); const [users,setUsers]=useState(initialUsers);
  const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false); const [modal,setModal]=useState<any>(null);
  const isSA=role==='SUPER_ADMIN';
  const activeHotels=useMemo(()=>hotels.filter(x=>x.active),[hotels]);

  async function save(resource:string,id:string|undefined,data:any){
    setBusy(true); setMsg('');
    try{
      const r=await fetch(id?`/api/admin/${resource}/${id}`:`/api/admin/${resource}`,{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||'Gagal menyimpan');
      setMsg('Berhasil disimpan.'); setModal(null); window.location.reload();
    }catch(e:any){setMsg(e.message||'Gagal menyimpan');}finally{setBusy(false);}
  }

  if(!isSA) return <div className="section"><div className="card"><h2>Master Data</h2><p className="muted">Admin hotel dapat melihat data master. Perubahan master data hanya dapat dilakukan oleh Super Admin.</p></div></div>;

  return <div className="section">
    {msg&&<div className="notice">{msg}</div>}
    <div className="grid">
      <div className="card stat"><div className="label">Hotels</div><div className="value">{hotels.length}</div><div className="sub">{hotels.filter(x=>x.active).length} active</div></div>
      <div className="card stat"><div className="label">Vehicles</div><div className="value">{vehicles.length}</div><div className="sub">{vehicles.filter(x=>x.active).length} active</div></div>
      <div className="card stat"><div className="label">Drivers</div><div className="value">{drivers.length}</div><div className="sub">{drivers.filter(x=>x.active).length} active</div></div>
      <div className="card stat"><div className="label">Users</div><div className="value">{users.length}</div><div className="sub">{users.filter(x=>x.active).length} active</div></div>
    </div>

    <div className="charts section">
      <div className="card"><div className="panel-head"><h2>Hotels</h2><button className="btn primary" onClick={()=>setModal({type:'hotel',data:{name:'',address:'',active:true}})}>+ Add Hotel</button></div>
        <div className="list">{hotels.map(x=><div className="listrow" key={x.id}><div><b>{x.name}</b><small>{x.address||'No address'}</small></div><div className="actions"><span className={`pill ${x.active?'ok':'bad'}`}>{x.active?'ACTIVE':'INACTIVE'}</span><button onClick={()=>setModal({type:'hotel',data:{...x}})}>Edit</button></div></div>)}</div>
      </div>

      <div className="card"><div className="panel-head"><h2>Vehicles</h2><button className="btn primary" onClick={()=>setModal({type:'vehicle',data:{vehicleName:'',vehicleType:'MPV',plateNumber:'',hotelId:activeHotels[0]?.id||'',active:true}})}>+ Add Vehicle</button></div>
        <div className="tablewrap"><table className="table"><thead><tr><th>Name</th><th>Type</th><th>Plate</th><th>Hotel</th><th>Status</th><th></th></tr></thead><tbody>{vehicles.map(x=><tr key={x.id}><td>{x.vehicleName||'-'}</td><td>{x.vehicleType}</td><td>{x.plateNumber}</td><td>{x.hotel.name}</td><td><span className={`pill ${x.active?'ok':'bad'}`}>{x.active?'ACTIVE':'INACTIVE'}</span></td><td><button onClick={()=>setModal({type:'vehicle',data:{...x}})}>Edit</button></td></tr>)}</tbody></table></div>
      </div>
    </div>

    <div className="charts section">
      <div className="card"><div className="panel-head"><h2>Drivers</h2><button className="btn primary" onClick={()=>setModal({type:'driver',data:{name:'',phone:'',hotelId:activeHotels[0]?.id||'',active:true}})}>+ Add Driver</button></div>
        <div className="list">{drivers.map(x=><div className="listrow" key={x.id}><div><b>{x.name}</b><small>{x.hotel.name} {x.phone?`• ${x.phone}`:''}</small></div><div className="actions"><span className={`pill ${x.active?'ok':'bad'}`}>{x.active?'ACTIVE':'INACTIVE'}</span><button onClick={()=>setModal({type:'driver',data:{...x}})}>Edit</button></div></div>)}</div>
      </div>

      <div className="card"><div className="panel-head"><h2>Users</h2><button className="btn primary" onClick={()=>setModal({type:'user',data:{username:'',name:'',password:'',role:'ADMIN',hotelId:activeHotels[0]?.id||'',driverId:'',active:true}})}>+ New User</button></div>
        <div className="tablewrap"><table className="table"><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Hotel</th><th>Driver</th><th>Status</th><th></th></tr></thead><tbody>{users.map(x=><tr key={x.id}><td>{x.username}</td><td>{x.name}</td><td>{x.role}</td><td>{x.hotel?.name||'All Hotels'}</td><td>{x.driver?.name||'-'}</td><td><span className={`pill ${x.active?'ok':'bad'}`}>{x.active?'ACTIVE':'INACTIVE'}</span></td><td><button onClick={()=>setModal({type:'user',data:{...x,password:'',driverId:x.driverId||x.driver?.id||''}})}>Edit</button></td></tr>)}</tbody></table></div>
      </div>
    </div>


    <div className="section card"><div className="panel-head"><h2>Recent Audit Log</h2><span className="muted">20 aktivitas terakhir</span></div><div className="tablewrap"><table className="table"><thead><tr><th>Waktu</th><th>User</th><th>Action</th><th>Detail</th></tr></thead><tbody>{logs.map(x=><tr key={x.id}><td>{new Date(x.createdAt).toLocaleString('id-ID')}</td><td>{x.user.name}</td><td><span className="pill">{x.action}</span></td><td>{x.notes||x.newValue||'-'}</td></tr>)}</tbody></table></div></div>
    {modal&&<EditorModal modal={modal} hotels={activeHotels} drivers={drivers} busy={busy} onClose={()=>setModal(null)} onSave={(data:any)=>save(modal.type==='hotel'?'hotels':modal.type==='vehicle'?'vehicles':modal.type==='driver'?'drivers':'users',modal.data.id,data)}/>} 
  </div>
}

function EditorModal({modal,hotels,drivers,busy,onClose,onSave}:{modal:any;hotels:Hotel[];drivers:Driver[];busy:boolean;onClose:()=>void;onSave:(data:any)=>void}){
  const [data,setData]=useState({...modal.data}); const type=modal.type;
  const title=type==='hotel'?(data.id?'Edit Hotel':'Add Hotel'):type==='vehicle'?(data.id?'Edit Vehicle':'Add Vehicle'):type==='driver'?(data.id?'Edit Driver':'Add Driver'):(data.id?'Edit User':'New User');
  const set=(k:string,v:any)=>setData((d:any)=>({...d,[k]:v}));
  return <div className="modal-backdrop"><div className="modal"><div className="panel-head"><h2>{title}</h2><button className="close" onClick={onClose}>×</button></div>
    {type==='hotel'&&<><label>Nama Hotel<input value={data.name||''} onChange={e=>set('name',e.target.value)}/></label><label>Alamat<input value={data.address||''} onChange={e=>set('address',e.target.value)}/></label></>}
    {type==='vehicle'&&<><label>Nama Mobil<input placeholder="Toyota Innova" value={data.vehicleName||''} onChange={e=>set('vehicleName',e.target.value)}/></label><label>Type<input value={data.vehicleType||''} onChange={e=>set('vehicleType',e.target.value)}/></label><label>Nomor Polisi<input value={data.plateNumber||''} onChange={e=>set('plateNumber',e.target.value)}/></label><label>Hotel<select value={data.hotelId||''} onChange={e=>set('hotelId',e.target.value)}>{hotels.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></label></>}
    {type==='driver'&&<><label>Nama Driver<input value={data.name||''} onChange={e=>set('name',e.target.value)}/></label><label>No. HP<input value={data.phone||''} onChange={e=>set('phone',e.target.value)}/></label><label>Hotel<select value={data.hotelId||''} onChange={e=>set('hotelId',e.target.value)}>{hotels.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></label></>}
    {type==='user'&&<><label>Username<input value={data.username||''} onChange={e=>set('username',e.target.value)}/></label><label>Nama<input value={data.name||''} onChange={e=>set('name',e.target.value)}/></label><label>Password {data.id&&<small>(kosongkan jika tidak diubah)</small>}<input type="password" value={data.password||''} onChange={e=>set('password',e.target.value)}/></label><label>Role<select value={data.role||'ADMIN'} onChange={e=>set('role',e.target.value)}><option value="ADMIN">ADMIN</option><option value="DRIVER">DRIVER</option><option value="SUPER_ADMIN">SUPER ADMIN</option></select></label>{data.role==='DRIVER'&&<label>Driver<select value={data.driverId||''} onChange={e=>{const id=e.target.value;const d=drivers.find(x=>x.id===id);set('driverId',id);if(d)set('hotelId',d.hotelId);}}><option value="">Pilih Driver</option>{drivers.filter(d=>d.active).map(d=><option key={d.id} value={d.id}>{d.name} — {d.hotel.name}</option>)}</select></label>}<label>Hotel<select value={data.hotelId||''} onChange={e=>set('hotelId',e.target.value)}><option value="">All Hotels</option>{hotels.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select></label></>}
    <label className="check"><input type="checkbox" checked={data.active!==false} onChange={e=>set('active',e.target.checked)}/> Active</label>
    <div className="modal-actions"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy} onClick={()=>onSave(data)}>{busy?'Saving...':'Save'}</button></div>
  </div></div>
}
