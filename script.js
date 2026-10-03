const globeEl=document.getElementById("globe");
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,globeEl.clientWidth/globeEl.clientHeight,.1,100);
camera.position.set(0,0,7);

const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(globeEl.clientWidth,globeEl.clientHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
globeEl.appendChild(renderer.domElement);

const group=new THREE.Group();
scene.add(group);

const globe=new THREE.Mesh(
  new THREE.SphereGeometry(1.72,64,64),
  new THREE.MeshStandardMaterial({color:0x0b7069,roughness:.72,metalness:.04})
);
group.add(globe);

const atmosphere=new THREE.Mesh(
  new THREE.SphereGeometry(1.81,64,64),
  new THREE.MeshBasicMaterial({color:0x8fd77c,transparent:true,opacity:.12,side:THREE.BackSide})
);
group.add(atmosphere);

const points=[];
for(let i=0;i<150;i++){
  const phi=Math.acos(2*Math.random()-1),theta=2*Math.PI*Math.random(),r=1.75;
  points.push(new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta)));
}
const dotGeo=new THREE.BufferGeometry().setFromPoints(points);
const dots=new THREE.Points(dotGeo,new THREE.PointsMaterial({color:0xa4e58f,size:.025,transparent:true,opacity:.78}));
group.add(dots);

const routeMat=new THREE.LineBasicMaterial({color:0xf9a52b,transparent:true,opacity:.9});
function route(a,b){
  const mid=new THREE.Vector3((a.x+b.x)/2,(a.y+b.y)/2+.8,(a.z+b.z)/2);
  const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
  const g=new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  group.add(new THREE.Line(g,routeMat));
}
route(new THREE.Vector3(-.9,.45,1.43),new THREE.Vector3(1.25,.2,1.12));
route(new THREE.Vector3(-.2,-.8,1.5),new THREE.Vector3(.75,.95,1.28));

const light=new THREE.DirectionalLight(0xffffff,2.4);
light.position.set(4,4,5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x9bd6c4,1.2));

let targetX=0,targetY=0,scrollProgress=0;
window.addEventListener("mousemove",e=>{
  targetX=(e.clientX/innerWidth-.5)*.42;
  targetY=(e.clientY/innerHeight-.5)*.22;
});

function updateScroll(){
  const hero=document.querySelector(".hero");
  if(!hero)return;
  const rect=hero.getBoundingClientRect();
  const range=Math.max(1,hero.offsetHeight-innerHeight);
  scrollProgress=Math.min(1,Math.max(0,-rect.top/range));
}
window.addEventListener("scroll",updateScroll,{passive:true});
updateScroll();

const plane=document.querySelector(".plane");
const pinOne=document.querySelector(".pin-one");
const pinTwo=document.querySelector(".pin-two");
const routeCard=document.querySelector(".floating-card");

function animate(){
  requestAnimationFrame(animate);
  const t=performance.now()*.001;

  const p=scrollProgress;
  group.rotation.y += .002;
  group.rotation.y += (p*2.7 + targetX - group.rotation.y)*.035;
  group.rotation.x += (targetY + Math.sin(t*.7)*.035 - group.rotation.x)*.025;

  const scale=1 + Math.sin(t*1.4)*.015 + p*.18;
  group.scale.setScalar(scale);

  const sceneEl=document.querySelector(".hero-scene");
  if(sceneEl){
    const x=p*210;
    const y=-p*120;
    const r=p*18;
    sceneEl.style.transform=`translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${1+p*.08})`;
    sceneEl.style.opacity=String(1-p*.38);
  }

  if(plane){
    const x=-10 + p*120;
    const y=35 - p*100;
    plane.style.transform=`translate3d(${x}px,${y}px,0) rotate(${-12+p*30}deg) scale(${1+p*.25})`;
  }

  if(pinOne) pinOne.style.transform=`translate3d(${p*35}px,${p*-25}px,0) scale(${1+p*.7})`;
  if(pinTwo) pinTwo.style.transform=`translate3d(${p*-45}px,${p*30}px,0) scale(${1+p*.5})`;
  if(routeCard){
    routeCard.style.transform=`translate3d(${p*-120}px,${p*110}px,0) rotate(${2-p*8}deg)`;
    routeCard.style.opacity=String(1-p*.75);
  }

  const orbit=document.querySelector(".journey-orbit");
  if(orbit){
    orbit.style.transform=`translate3d(0,${p*-35}px,0) rotate(${p*28}deg) scale(${1+p*.06})`;
  }

  renderer.render(scene,camera);
}
animate();

window.addEventListener("resize",()=>{
  camera.aspect=globeEl.clientWidth/globeEl.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(globeEl.clientWidth,globeEl.clientHeight);
});

const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting)e.target.classList.add("visible");
}),{threshold:.14});
document.querySelectorAll(".reveal").forEach(x=>io.observe(x));

document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{
  c.parentElement.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active");
}));

const modal=document.getElementById("modal");
const card=modal.querySelector(".modal-card");
document.getElementById("generate").onclick=()=>{
  modal.classList.add("open");
  card.classList.remove("done");
  setTimeout(()=>card.classList.add("done"),1900);
};
document.getElementById("close").onclick=()=>modal.classList.remove("open");
document.getElementById("viewTrip").onclick=()=>{
  modal.classList.remove("open");
  document.querySelector(".result-preview").scrollIntoView({behavior:"smooth"});
};
modal.addEventListener("click",e=>{
  if(e.target===modal)modal.classList.remove("open");
});
