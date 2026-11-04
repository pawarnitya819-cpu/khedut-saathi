// Providers return records with source and reporting timestamps. Replace this adapter when connecting official feeds.
const districts = [
['Rajkot','રાજકોટ'],['Junagadh','જૂનાગઢ'],['Amreli','અમરેલી'],['Ahmedabad','અમદાવાદ'],['Surat','સુરત'],['Vadodara','વડોદરા'],['Kutch','કચ્છ'],['Jamnagar','જામનગર'],['Bhavnagar','ભાવનગર'],['Surendranagar','સુરેન્દ્રનગર'],['Porbandar','પોરબંદર'],['Morbi','મોરબી'],['Gir Somnath','ગીર સોમનાથ'],['Devbhumi Dwarka','દેવભૂમિ દ્વારકા'],['Botad','બોટાદ'],['Banaskantha','બનાસકાંઠા'],['Patan','પાટણ'],['Mehsana','મહેસાણા'],['Sabarkantha','સાબરકાંઠા'],['Aravalli','અરવલ્લી'],['Gandhinagar','ગાંધીનગર'],['Kheda','ખેડા'],['Anand','આણંદ'],['Mahisagar','મહીસાગર'],['Panchmahal','પંચમહાલ'],['Dahod','દાહોદ'],['Chhota Udepur','છોટા ઉદેપુર'],['Narmada','નર્મદા'],['Bharuch','ભરૂચ'],['Tapi','તાપી'],['Dang','ડાંગ'],['Navsari','નવસારી'],['Valsad','વલસાડ'],['Vav-Tharad','વાવ-થરાદ']];
const crops=[['Groundnut','મગફળી'],['Cotton','કપાસ']];
const markets=[['Rajkot APMC','રાજકોટ APMC'],['Gondal APMC','ગોંડલ APMC'],['Junagadh APMC','જૂનાગઢ APMC'],['Amreli APMC','અમરેલી APMC']];
const sampleSource=['College prototype sample','કોલેજ પ્રોટોટાઇપનો નમૂનો'];
const provider={
 async weather(district){return {district,rain:district%2?65:20,issued:'2026-11-04T07:00:00+05:30',updated:'2026-11-04T07:30:00+05:30',source:sampleSource,sample:true};},
 async prices(crop){return markets.map((market,id)=>({id,market,price:(crop?[7320,7500,71.5,null]:[6250,6480,60,null])[id],unit:id===2?'kg':'q',grade:id===3?null:crop?['Medium staple','મધ્યમ રેસો']:id===2?['Bold','મોટા દાણા']:['FAQ','સામાન્ય ગુણવત્તા (FAQ)'],date:id===3?null:id===2?'2026-11-02':'2026-11-04',source:sampleSource,sample:true}));}
};
const schemes=[
{title:['PM-KISAN','પીએમ-કિસાન'],summary:['Income support for eligible landholding farmer families.','પાત્ર જમીનધારક ખેડૂત પરિવારોને આવક સહાય.'],docs:[['Aadhaar card','આધાર કાર્ડ'],['Bank account details','બેંક ખાતાની વિગતો'],['Land records','જમીનનો દાખલો']],url:'https://pmkisan.gov.in/RegistrationFormNew.aspx'},
{title:['Gujarat farm equipment assistance','ગુજરાત ખેતી સાધન સહાય'],summary:['Eligible farmers can apply for assistance with farm equipment when applications open.','અરજીઓ ખુલ્લી હોય ત્યારે પાત્ર ખેડૂતો ખેતી સાધનો માટે સહાયની અરજી કરી શકે છે.'],docs:[['Aadhaar card','આધાર કાર્ડ'],['Land records (7/12 and 8-A)','જમીનના દાખલા (૭/૧૨ અને ૮-અ)'],['Bank account details','બેંક ખાતાની વિગતો']],url:'https://ikhedut.gujarat.gov.in/iKhedutPublicScheme/'}
];