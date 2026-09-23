export const parameterGroups=[
 {title:'Opening position · 1 January 2026',fields:[['openingCash','Cash','E02: OPEN'],['openingReceivables','Receivables','Assumed fully settled by RCPT-001; no opening ledger'],['openingInventory','Inventory','E05 p2'],['openingPpeCost','PPE cost','E08 Assets row 4'],['openingDepreciation','Accumulated depreciation','E08 Assets row 4'],['openingPayables','Supplier payables','Inferred from 126,000 − 459,000 + 378,000'],['openingPayroll','Payroll payable','E07 Payroll row 7'],['openingDebt','Bank debt','E09 p1'],['openingInterest','Interest payable','Implied by E09 and E11'],['openingInsurance','Prepaid insurance','No supporting policy supplied; provisional zero']]},
 {title:'Revenue and working capital',fields:[['northStarRevenue','NorthStar sales','E04 INV-26012'],['freedomRevenue','Freedom sales','E04 INV-26031'],['phoenixRevenue','Phoenix sales','E04 INV-26047'],['libertyRevenue','Liberty sales','E04 INV-26063'],['webFsbRevenue','Finally Single web sales','E03 CRM row 8'],['webNcbRevenue','Never Call Back web sales','E03 CRM row 9'],['customerDeposits','Future-event deposits','E04 p2'],['badDebt','R-17 impairment','E04 p2 and E11'],['purchases','Materials purchases','E06 p1'],['physicalCogs','Materials consumed','E05 p2'],['inventoryWriteoff','Damaged stock write-off','E05 and E11'],['countNetInventory','Count-based net inventory','E05 p1: 79,000 + 42,000']]},
 {title:'Payroll and operating costs',fields:[['eventPayroll','Event delivery wages','E07 row 4'],['salesPayroll','Sales team wages','E07 row 5'],['officePayroll','Office wages','E07 row 6'],['rent','Rent expense','E02 RENT; cash equals expense assumption'],['marketing','Marketing expense','E02 MKT; cash equals expense assumption'],['software','Software expense','E02 SOFT; cash equals expense assumption'],['utilities','Utilities expense','E02 UTIL; cash equals expense assumption'],['repairExpense','Repair expense','E06 R-771'],['insuranceExpense','Insurance consumed','Unquantified: no policy or balances supplied'],['legalProvision','Employee claim provision','E09 p2: range 20,000–30,000'],['disposalProvision','Disposal provision','Quote 2,000; no existing obligation established, base zero']]},
 {title:'Fixed assets and financing',fields:[['packMachine','Packaging machine addition','E06 A-910'],['photoBooth','Photo booth addition','E06 P-404'],['depreciation','Period depreciation','E08 independent schedule estimate'],['interestExpense','Interest expense','E09 loan schedule'],['newLoan','New loan','E09 p1'],['principalRepaid','Principal repaid','E02 PRINCIPAL'],['ownerDistributions','Owner distributions','E02 VILLA + OWNERCARD']]}
];
export function compute(s){
 const p=s.parameters,b=s.bank;
 const sales=['northStarRevenue','freedomRevenue','phoenixRevenue','libertyRevenue','webFsbRevenue','webNcbRevenue'].reduce((n,k)=>n+p[k],0);
 const payroll=p.eventPayroll+p.salesPayroll+p.officePayroll;
 const inventory=p.openingInventory+p.purchases-p.physicalCogs-p.inventoryWriteoff;
 const receivables=p.openingReceivables+sales-b.earnedCollections-p.badDebt;
 const prepaidInsurance=p.openingInsurance-p.insuranceExpense;
 const payables=p.openingPayables+p.purchases-b.suppliers;
 const payrollPayable=p.openingPayroll+payroll-b.payroll;
 const interestPayable=p.openingInterest+p.interestExpense-b.interest;
 const ppeCost=p.openingPpeCost+p.packMachine+p.photoBooth;
 const accumulatedDepreciation=p.openingDepreciation+p.depreciation;
 const netPpe=ppeCost-accumulatedDepreciation;
 const debt=p.openingDebt+p.newLoan-p.principalRepaid;
 const grossProfit=sales-p.physicalCogs-p.eventPayroll;
 const opex=p.salesPayroll+p.officePayroll+p.rent+p.marketing+p.software+p.utilities+p.repairExpense+p.depreciation+p.badDebt+p.inventoryWriteoff+p.insuranceExpense+p.legalProvision+p.disposalProvision;
 const operatingProfit=grossProfit-opex,profit=operatingProfit-p.interestExpense;
 const operatingCf=b.earnedCollections+b.deposits-b.suppliers-b.payroll-b.rent-b.marketing-b.software-b.utilities-b.repairs-b.interest;
 const investingCf=-b.equipment;
 const financingCf=b.loan-b.principal-b.distributions;
 const cash=p.openingCash+operatingCf+investingCf+financingCf;
 const openingAssets=p.openingCash+p.openingReceivables+p.openingInventory+p.openingPpeCost-p.openingDepreciation+p.openingInsurance;
 const openingLiabilities=p.openingPayables+p.openingPayroll+p.openingDebt+p.openingInterest;
 const openingEquity=openingAssets-openingLiabilities;
 const equity=openingEquity+profit-p.ownerDistributions;
 const currentAssets=cash+receivables+inventory+prepaidInsurance;
 const assets=currentAssets+netPpe;
 const liabilities=payables+payrollPayable+interestPayable+p.customerDeposits+debt+p.legalProvision+p.disposalProvision;
 const indirectCf=profit+p.depreciation+p.badDebt+p.inventoryWriteoff-(receivables-p.openingReceivables+p.badDebt)-(inventory-p.openingInventory+p.inventoryWriteoff)-(prepaidInsurance-p.openingInsurance)+(payables-p.openingPayables)+(payrollPayable-p.openingPayroll)+(interestPayable-p.openingInterest)+p.customerDeposits+p.legalProvision+p.disposalProvision;
 return {sales,payroll,inventory,receivables,prepaidInsurance,payables,payrollPayable,interestPayable,ppeCost,accumulatedDepreciation,netPpe,debt,grossProfit,opex,operatingProfit,profit,operatingCf,investingCf,financingCf,cash,openingAssets,openingLiabilities,openingEquity,equity,currentAssets,assets,liabilities,indirectCf,balanceGap:assets-liabilities-equity,stockGap:p.countNetInventory-inventory};
}
export function reconciliations(s,c=compute(s)){
 const p=s.parameters,b=s.bank;
 const check=(id,title,expected,actual,basis,kind='arithmetic')=>({id,title,expected,actual,difference:actual-expected,status:Math.abs(actual-expected)<.005?'pass':'unresolved',basis,kind});
 return [
 check('balance','Balance sheet',c.assets,c.liabilities+c.equity,'Balances within the explicitly stated opening-position assumptions.'),
 check('bank','Cash to bank',b.closingCash,c.cash,'Independent bank confirmation E11 and bank export E02.','external'),
 check('cf','Cash-flow roll-forward',c.cash,p.openingCash+c.operatingCf+c.investingCf+c.financingCf,'Opening cash + operating + investing + financing.'),
 check('indirect','Direct to indirect operating cash flow',c.operatingCf,c.indirectCf,'Separate working-capital reconciliation; interest classified as operating.'),
 check('ar','Receivables roll-forward',c.receivables,p.openingReceivables+c.sales-b.earnedCollections-p.badDebt,'Assumes opening AR equals the 35,000 old-customer settlement.'),
 check('inventory','Inventory roll-forward',c.inventory,p.openingInventory+p.purchases-p.physicalCogs-p.inventoryWriteoff,'80,000 + purchases − consumption − write-off.'),
 check('stock-count','Inventory to independent count',p.countNetInventory,c.inventory,'Count gives 121,000 net; supplied movement schedule gives 112,000. No unexplained adjustment is posted.','external'),
 check('ppe','PPE cost roll-forward',c.ppeCost,p.openingPpeCost+p.packMachine+p.photoBooth,'Opening cost plus two supported additions.'),
 check('depreciation','Accumulated depreciation',c.accumulatedDepreciation,p.openingDepreciation+p.depreciation,'45,000 opening plus 24,000 estimated period charge.'),
 check('debt','Debt to bank confirmation',b.closingDebt,c.debt,'100,000 opening + 50,000 advance − 19,000 principal.','external'),
 check('interest','Interest to confirmation',b.closingInterest,c.interestPayable,'Opening interest + period expense − cash paid.','external'),
 check('payables','Suppliers to confirmations',b.confirmedPayables,c.payables,'Opening AP of 45,000 is inferred, not directly supplied.','external'),
 check('equity','Equity roll-forward',c.equity,c.openingEquity+c.profit-p.ownerDistributions,'Conditional opening equity + profit − distributions.')
 ];
}
const row=(label,amount,evidence,note='')=>({label,amount,evidence,note});
export function schedules(s,c=compute(s)){
 const p=s.parameters,b=s.bank;
 return {
 insurance:{title:'Prepaid insurance · unsupported',columns:['Movement / evidence status','EUR'],rows:[['Opening prepaid insurance · provisional input',p.openingInsurance],['Insurance payments identified in supplied bank export',0],['Period consumption · provisional input',-p.insuranceExpense],['Closing prepaid insurance · conditional',c.prepaidInsurance]],evidence:[],note:'No policy, coverage dates, premium or opening insurance ledger was supplied. Zero is not a confirmed balance. Obtain the policy and opening ledger before determining consumption; do not infer a premium from another submission.'},
 revenueAndReceivables:{title:'Revenue and receivables',columns:['Customer / record','Revenue','Cash received','Gross balance','Impairment','Net balance'],rows:[
 ['Opening customer',0,35000,p.openingReceivables-35000,0,p.openingReceivables-35000],
 ['NorthStar',p.northStarRevenue,180000,p.northStarRevenue-180000,0,p.northStarRevenue-180000],
 ['Freedom Festivals',p.freedomRevenue,142000,p.freedomRevenue-142000,0,p.freedomRevenue-142000],
 ['Phoenix',p.phoenixRevenue,70000,p.phoenixRevenue-70000,0,p.phoenixRevenue-70000],
 ['Liberty Hotels',p.libertyRevenue,95000,p.libertyRevenue-95000,0,p.libertyRevenue-95000],
 ['Finally Single web',p.webFsbRevenue,250000,p.webFsbRevenue-250000,0,p.webFsbRevenue-250000],
 ['Never Call Back web',p.webNcbRevenue,37000,p.webNcbRevenue-37000,p.badDebt,p.webNcbRevenue-37000-p.badDebt],
 ['TOTAL',c.sales,b.earnedCollections,c.receivables+p.badDebt,p.badDebt,c.receivables]],evidence:['E02','E03','E04','E11'],note:'Future-event receipts of 90,000 are excluded from earned collections and shown as liabilities. Opening AR settlement assumed exhaustive. Platform fees and other returns are not supplied.'},
 inventoryAndCogs:{title:'Inventory and COGS',columns:['Movement','EUR'],rows:[['Opening inventory',p.openingInventory],['Purchases',p.purchases],['Valid-sales consumption',-p.physicalCogs],['Damaged-stock write-off',-p.inventoryWriteoff],['Closing inventory: roll-forward',c.inventory],['Closing inventory: physical count',p.countNetInventory],['Unresolved difference',c.stockGap]],evidence:['E05','E06','E11'],note:'Base uses stated consumption of 405,000. Count-based alternative requires 396,000 consumption, adding 9,000 to inventory and profit. This conflict needs source correction, not a balancing journal.'},
 payroll:{title:'Payroll and accruals',columns:['Department / movement','Expense','Cash paid','Net accrual movement'],rows:[['Event delivery',p.eventPayroll,75000,p.eventPayroll-75000],['Sales',p.salesPayroll,68000,p.salesPayroll-68000],['Office and finance',p.officePayroll,88000,p.officePayroll-88000],['TOTAL',c.payroll,b.payroll,c.payroll-b.payroll],['Opening payroll payable',p.openingPayroll,null,null],['Closing payroll payable',c.payrollPayable,null,null]],evidence:['E02','E07'],note:'The bank provides a single Jan–Aug total. Monthly payments and opening liability allocation by department are unknown. Founder “bonus” of 110,000 duplicates the owner distributions.'},
 operatingExpenses:{title:'Operating expenses',columns:['Expense','Recognized','Cash in bank','Basis'],rows:[['Rent',p.rent,b.rent,'Cash assumed to equal period expense'],['Marketing',p.marketing,b.marketing,'Cash assumed to equal period expense'],['Software',p.software,b.software,'No prepayment schedule supplied'],['Utilities',p.utilities,b.utilities,'No accrual schedule supplied'],['Repair',p.repairExpense,b.repairs,'R-771 restores normal operation'],['Insurance',p.insuranceExpense,0,'No supporting insurance data: zero is provisional'],['Legal claim',p.legalProvision,0,'Probable at reporting date'],['Disposal',p.disposalProvision,0,'2,000 future quote, no present obligation established']],evidence:['E02','E06','E09','E11'],note:'Sales and office payroll, depreciation and write-offs are presented separately in P&L. Cash-paid expense assumptions require invoice verification.'},
 ppeAndDepreciation:{title:'PPE and depreciation',columns:['Movement','EUR'],rows:[['Opening cost',p.openingPpeCost],['Packaging machine',p.packMachine],['Photo booth',p.photoBooth],['Closing cost',c.ppeCost],['Opening accumulated depreciation',p.openingDepreciation],['Period depreciation estimate',p.depreciation],['Closing accumulated depreciation',c.accumulatedDepreciation],['Closing net PPE',c.netPpe]],evidence:['E06','E08'],note:'Both additions available for use 10 May. The 24,000 aggregate estimate is provided; useful lives, residual values and asset-level depreciation are not supplied. No invented allocation is made.'},
 debtAndInterest:{title:'Debt and interest',columns:['Movement','EUR'],rows:[['Opening loan',p.openingDebt],['New borrowing',p.newLoan],['Principal repayment',-p.principalRepaid],['Closing principal',c.debt],['Opening interest payable',p.openingInterest],['Interest expense',p.interestExpense],['Interest paid',-b.interest],['Closing interest payable',c.interestPayable]],evidence:['E02','E09','E11'],note:'Loan maturity information is absent. Total principal is reported without claiming a supported current/non-current split.'},
 equityAndDistributions:{title:'Equity and distributions',columns:['Movement','EUR'],rows:[['Conditional opening assets',c.openingAssets],['Conditional opening liabilities',-c.openingLiabilities],['Conditional opening equity',c.openingEquity],['Period profit',c.profit],['Owner distributions',-p.ownerDistributions],['Closing equity',c.equity]],evidence:['E02','E05','E07','E08','E09'],note:'Opening equity is a transparent residual under disclosed opening AR/AP and insurance assumptions, not an externally verified balance. Owner recovery rights are not established.'},
 suppliers:{title:'Supplier reconciliation',columns:['Supplier','Inferred opening AP','Purchases','Cash paid','Confirmed closing AP'],rows:[['BoxWorks',0,130000,105000,25000],['Glass & Drama',0,120000,92000,28000],['Print Again',0,95000,81000,14000],['Event Things',45000,114000,100000,59000],['TOTAL',p.openingPayables,p.purchases,b.suppliers,c.payables]],evidence:['E02','E06'],note:'45,000 opening Event Things payable is implied by the roll-forward. Supplier-level opening balances need confirmation; alternate movements are not supplied.'}
 };
}
export function statements(s,c=compute(s)){
 const p=s.parameters,b=s.bank;
 return {
 profitAndLoss:{title:'Profit and loss',period:'1 January–31 August 2026',rows:[row('Revenue',c.sales,['E03','E04']),row('Materials consumed',-p.physicalCogs,['E05']),row('Event delivery payroll',-p.eventPayroll,['E07']),row('Gross profit',c.grossProfit,['E03','E05','E07']),row('Sales payroll',-p.salesPayroll,['E07']),row('Office payroll',-p.officePayroll,['E07']),row('Rent',-p.rent,['E02']),row('Marketing',-p.marketing,['E02']),row('Software',-p.software,['E02']),row('Utilities',-p.utilities,['E02']),row('Repairs',-p.repairExpense,['E06']),row('Depreciation',-p.depreciation,['E08']),row('Receivable impairment',-p.badDebt,['E04','E11']),row('Inventory write-off',-p.inventoryWriteoff,['E05','E11']),row('Insurance expense',-p.insuranceExpense,[],'Unsupported amount; provisional assumption'),row('Legal provision',-p.legalProvision,['E09','E11']),row('Disposal provision',-p.disposalProvision,['E05','E11'],'Base does not recognize quote as an obligation'),row('Operating profit',c.operatingProfit,[]),row('Interest expense',-p.interestExpense,['E09']),row('Net profit',c.profit,[])],note:'Provisional reconstruction. No VAT or corporate income tax. Stock conflict and missing insurance information remain open.'},
 cashFlow:{title:'Cash-flow statement',period:'1 January–31 August 2026',rows:[row('Earned-sales and opening-AR collections',b.earnedCollections,['E02']),row('Future customer deposits',b.deposits,['E02']),row('Supplier payments',-b.suppliers,['E02']),row('Payroll payments',-b.payroll,['E02']),row('Rent, marketing, software and utilities',-b.rent-b.marketing-b.software-b.utilities,['E02']),row('Repairs paid',-b.repairs,['E02']),row('Interest paid',-b.interest,['E02']),row('Net operating cash flow',c.operatingCf,[]),row('Equipment purchases',c.investingCf,['E02','E06']),row('New borrowing',b.loan,['E02']),row('Principal repaid',-b.principal,['E02']),row('Owner distributions',-b.distributions,['E02']),row('Net financing cash flow',c.financingCf,[]),row('Net movement in cash',c.cash-p.openingCash,[]),row('Opening cash',p.openingCash,['E02']),row('Closing cash',c.cash,['E02','E11'])],note:'Direct method. Interest paid is operating; borrowing, principal and distributions are financing. The bank evidence fixes cash independently of profit assumptions.'},
 balanceSheet:{title:'Balance sheet',period:'31 August 2026',rows:[row('Cash',c.cash,['E02','E11']),row('Receivables, net',c.receivables,['E03','E04']),row('Inventory, net',c.inventory,['E05','E06']),row('Prepaid insurance',c.prepaidInsurance,[],'No insurance policy supplied'),row('Current assets',c.currentAssets,[]),row('PPE cost',c.ppeCost,['E06','E08']),row('Accumulated depreciation',-c.accumulatedDepreciation,['E08']),row('Net PPE',c.netPpe,[]),row('Total assets',c.assets,[]),row('Supplier payables',c.payables,['E06']),row('Payroll payable',c.payrollPayable,['E07']),row('Customer deposits',p.customerDeposits,['E04']),row('Interest payable',c.interestPayable,['E11']),row('Legal provision',p.legalProvision,['E09']),row('Disposal provision',p.disposalProvision,['E11']),row('Bank debt · maturity split unknown',c.debt,['E11']),row('Total liabilities',c.liabilities,[]),row('Opening equity · conditional',c.openingEquity,[]),row('Period profit',c.profit,[]),row('Owner distributions',-p.ownerDistributions,['E09']),row('Closing equity',c.equity,[]),row('Total liabilities and equity',c.liabilities+c.equity,[])],note:'Balances conditionally. Opening AR/AP/equity and insurance are assumptions. Loan maturity split is unknown. An arithmetic balance does not resolve incomplete evidence.'}
 };
}
export function buildSubmission(s){
 const c=compute(s);
 const decisions=s.decisions.map(d=>({...d,evidenceDetails:d.evidenceDetails||d.aiOriginal?.evidence||[],changedFromAI:d.reviewTier==='material_judgment'?(d.answer!==d.aiProposal||JSON.stringify(d.statementEffect)!==JSON.stringify(d.aiStatementEffect)):undefined}));
 return {submissionChecks:submissionChecks(s),schemaVersion:'1.0',caseId:'DPI-HT-01',student:s.student,reportingDate:'2026-08-31',currency:'EUR',preparedBy:decisions.every(d=>d.certified)?'AI-assisted reconstruction; answers approved by student':'AI-assisted reconstruction; student review pending unless individually marked',identityOmittedByRequest:!!s.identityOmittedByRequest,certificationStatus:decisions.every(d=>d.certified)?'student-reviewed':'pending-student-review',evidence:s.evidence,decisions,schedules:schedules(s,c),statements:statements(s,c),reconciliations:reconciliations(s,c),uncertainties:s.uncertainties,boardRecommendation:s.board,assumptions:s.parameters,sourceBankTotals:s.bank,analysisProvenance:s.analysisProvenance,updatedAt:s.updatedAt,revision:s.revision,modelChangedFromPrepared:JSON.stringify(s.parameters)!==JSON.stringify(s.initialParameters),decisionModelConsistency:'Numerical model inputs drive statements and schedules. Narrative decision edits do not automatically alter model inputs. Review both before final certification.',scenarioSummary:{baseProfit:c.profit,countBasedProfit:c.profit+c.stockGap,legalLowProfit:c.profit+pval(s,'legalProvision')-20000,legalHighProfit:c.profit+pval(s,'legalProvision')-30000,disposalIfObligatedProfit:c.profit+pval(s,'disposalProvision')-2000},financialPosition:c};
}
const pval=(s,k)=>s.parameters[k];
export function submissionChecks(s){
 const c=compute(s),issues=[];
 if(!s.identityOmittedByRequest&&(!s.student.name.trim()||!s.student.id.trim()))issues.push('Add your real name and student ID.');
 const pending=s.decisions.filter(d=>!d.certified).length;
 if(pending)issues.push(`${pending} answers still need your review and certification.`);
 if(JSON.stringify(s.parameters)!==JSON.stringify(s.initialParameters))issues.push('Model inputs changed: check numerical wording, decision effects and board conclusions against the recalculated statements.');
 if(Math.abs(c.stockGap)>.005)issues.push(`Inventory differs from the count by EUR ${c.stockGap.toLocaleString('en-IE')}; disclose the unresolved source conflict.`);
 issues.push('Insurance remains unsupported: zero is a provisional assumption, not a verified prepaid balance.');
 if(c.prepaidInsurance<0)issues.push('Insurance consumption exceeds the opening prepaid asset; this model needs a supported additional payment or payable treatment.');
 if(Math.abs(c.balanceGap)>.005)issues.push('The balance sheet does not reconcile.');
 const incomplete=s.decisions.filter(d=>!d.answer.trim()||/^(TBD|TODO|placeholder|Evidence-based conclusion:)/i.test(d.answer)||!d.evidence.length);
 if(incomplete.length)issues.push('Incomplete or placeholder answers: '+incomplete.map(d=>d.id).join(', '));
 return {status:'review-required',issues,decisionCount:s.decisions.length,materialJudgmentCount:s.decisions.filter(d=>d.reviewTier==='material_judgment').length};
}
export function validateState(s){
 if(!s||!s.parameters||!s.bank||!Array.isArray(s.decisions)||s.decisions.length!==100)throw Error('The case must contain all 100 decisions.');
 for(const group of parameterGroups)for(const [key] of group.fields)if(typeof s.parameters[key]!=='number'||!Number.isFinite(s.parameters[key])||s.parameters[key]<0)throw Error('Invalid model input: '+key);
 const ids=new Set();for(const d of s.decisions){if(!/^D\d{3}$/.test(d.id)||ids.has(d.id)||!d.answer?.trim()||!d.evidence?.length||!['low','medium','high'].includes(d.confidence))throw Error('Invalid decision '+d.id);ids.add(d.id);if(d.reviewTier==='material_judgment'){if(d.independentChallenge?.length<20||d.studentReasoning?.length<20)throw Error('Judgment reasoning is incomplete: '+d.id);for(const key of ['profit','cash','assets','liabilities','equity'])if(d.statementEffect[key]!==null&&!Number.isFinite(d.statementEffect[key]))throw Error('Invalid financial effect: '+d.id);}}
 for(let i=1;i<=100;i++)if(!ids.has('D'+String(i).padStart(3,'0')))throw Error('Missing decision '+i);
 if(s.decisions.filter(d=>d.reviewTier==='material_judgment').length!==25)throw Error('Exactly 25 material judgments are required.');
 if(!s.student||typeof s.student.name!=='string'||typeof s.student.id!=='string')throw Error('Invalid student details.');
 return true;
}
