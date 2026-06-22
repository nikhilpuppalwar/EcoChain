import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EcoChainModule", (m) => {
  const access = m.contract("EcoChainAccess");
  const token = m.contract("CarbonCredit");
  const market = m.contract("CarbonMarketplace", [token]);
  const retirement = m.contract("CreditRetirement", [token]);
  const audit = m.contract("AuditRegistry");

  return { access, token, market, retirement, audit };
});
