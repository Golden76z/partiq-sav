import { PrismaClient, Role, DocumentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Users
  const adminHash = await bcrypt.hash("admin123", 10);
  const agentHash = await bcrypt.hash("agent123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@partiq.fr" },
    update: {},
    create: {
      email: "admin@partiq.fr",
      passwordHash: adminHash,
      name: "Admin PartiQ",
      role: Role.ADMIN,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@partiq.fr" },
    update: {},
    create: {
      email: "agent@partiq.fr",
      passwordHash: agentHash,
      name: "Agent SAV",
      role: Role.AGENT,
    },
  });

  // Brands
  const delabie = await prisma.brand.upsert({
    where: { name: "DELABIE" },
    update: {},
    create: { name: "DELABIE" },
  });

  const kwc = await prisma.brand.upsert({
    where: { name: "KWC" },
    update: {},
    create: { name: "KWC" },
  });

  const dvs = await prisma.brand.upsert({
    where: { name: "DVS" },
    update: {},
    create: { name: "DVS" },
  });

  // DELABIE Products
  const tempostop = await prisma.product.upsert({
    where: { reference: "DEL-TMPS-001" },
    update: {},
    create: {
      brandId: delabie.id,
      name: "TEMPOSTOP",
      reference: "DEL-TMPS-001",
      category: "Robinet temporisé",
      description: "Robinet temporisé à poussoir pour lavabo, temporisation réglable de 5 à 30 secondes. Conforme aux normes EN 200.",
    },
  });

  const securitherm = await prisma.product.upsert({
    where: { reference: "DEL-SCTH-002" },
    update: {},
    create: {
      brandId: delabie.id,
      name: "SECURITHERM",
      reference: "DEL-SCTH-002",
      category: "Mitigeur thermostatique",
      description: "Mitigeur thermostatique anti-brûlure avec limiteur de température à 38°C. Idéal pour établissements de santé.",
    },
  });

  const temposoft = await prisma.product.upsert({
    where: { reference: "DEL-TMSF-003" },
    update: {},
    create: {
      brandId: delabie.id,
      name: "TEMPOSOFT",
      reference: "DEL-TMSF-003",
      category: "Robinet poussoir",
      description: "Robinet poussoir avec tête céramique et corps en laiton chromé. Débit régulé 6 L/min.",
    },
  });

  const bluetek = await prisma.product.upsert({
    where: { reference: "DEL-BLTK-004" },
    update: {},
    create: {
      brandId: delabie.id,
      name: "BLUETEK",
      reference: "DEL-BLTK-004",
      category: "Robinet électronique",
      description: "Robinet électronique infrarouge sans contact, alimentation secteur 230V ou batterie 6V.",
    },
  });

  const biofil = await prisma.product.upsert({
    where: { reference: "DEL-BIOF-005" },
    update: {},
    create: {
      brandId: delabie.id,
      name: "BIOFIL",
      reference: "DEL-BIOF-005",
      category: "Filtre anti-bactérien",
      description: "Filtre anti-bactérien point d'usage, rétention à 0,2 micron, durée d'utilisation 30 jours.",
    },
  });

  // KWC Products
  const domo = await prisma.product.upsert({
    where: { reference: "KWC-DOMO-001" },
    update: {},
    create: {
      brandId: kwc.id,
      name: "DOMO",
      reference: "KWC-DOMO-001",
      category: "Mitigeur cuisine",
      description: "Mitigeur cuisine avec bec pivotant 360°, douchette extractible 2 jets, finition inox.",
    },
  });

  const ono = await prisma.product.upsert({
    where: { reference: "KWC-ONO-002" },
    update: {},
    create: {
      brandId: kwc.id,
      name: "ONO",
      reference: "KWC-ONO-002",
      category: "Mitigeur lavabo",
      description: "Mitigeur lavabo design épuré, cartouche céramique 35mm, économiseur d'eau intégré.",
    },
  });

  const ava = await prisma.product.upsert({
    where: { reference: "KWC-AVA-003" },
    update: {},
    create: {
      brandId: kwc.id,
      name: "AVA",
      reference: "KWC-AVA-003",
      category: "Robinet cuisine",
      description: "Robinet cuisine à bec haut articulé, corps en laiton massif, cartouche céramique longue durée.",
    },
  });

  const inox = await prisma.product.upsert({
    where: { reference: "KWC-INOX-004" },
    update: {},
    create: {
      brandId: kwc.id,
      name: "INOX STAR",
      reference: "KWC-INOX-004",
      category: "Robinet collectivité",
      description: "Robinet collectivité tout inox 304L, résistant aux produits de nettoyage, démontage facilité.",
    },
  });

  // DVS Products
  const thermostat = await prisma.product.upsert({
    where: { reference: "DVS-THERM-001" },
    update: {},
    create: {
      brandId: dvs.id,
      name: "THERMOSTAT DOUCHE",
      reference: "DVS-THERM-001",
      category: "Mitigeur thermostatique douche",
      description: "Mitigeur thermostatique douche encastré, 2 sorties, température préréglée 38°C, limiteur anti-brûlure.",
    },
  });

  const compact = await prisma.product.upsert({
    where: { reference: "DVS-CMPT-002" },
    update: {},
    create: {
      brandId: dvs.id,
      name: "COMPACT",
      reference: "DVS-CMPT-002",
      category: "Robinet urinoir",
      description: "Robinet temporisé pour urinoir, débit 1,5 L/chasse, corps laiton, alimentation 1/2\".",
    },
  });

  const hygiene = await prisma.product.upsert({
    where: { reference: "DVS-HYG-003" },
    update: {},
    create: {
      brandId: dvs.id,
      name: "HYGIENE PRO",
      reference: "DVS-HYG-003",
      category: "Robinet hygiène",
      description: "Robinet hygiène coude commande au coude ou genou, idéal milieu médical et cuisine professionnelle.",
    },
  });

  // Spare Parts — TEMPOSTOP
  await prisma.sparePart.upsert({
    where: { reference: "DEL-TMPS-CAR-001" },
    update: {},
    create: {
      productId: tempostop.id,
      name: "Cartouche temporisée 5-30s",
      reference: "DEL-TMPS-CAR-001",
      description: "Cartouche de remplacement temporisée, réglage de 5 à 30 secondes.",
      compatibility: ["DEL-TMPS-001", "DEL-TMSF-003"],
      stock: 42,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DEL-TMPS-JNT-001" },
    update: {},
    create: {
      productId: tempostop.id,
      name: "Joint torique Ø12mm",
      reference: "DEL-TMPS-JNT-001",
      description: "Kit de 5 joints toriques de remplacement pour robinet temporisé.",
      compatibility: ["DEL-TMPS-001", "DEL-TMSF-003", "DEL-BLTK-004"],
      stock: 120,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DEL-TMPS-BTN-001" },
    update: {},
    create: {
      productId: tempostop.id,
      name: "Bouton poussoir chromé",
      reference: "DEL-TMPS-BTN-001",
      description: "Bouton poussoir de remplacement finition chromée brillante.",
      compatibility: ["DEL-TMPS-001"],
      stock: 18,
    },
  });

  // Spare Parts — SECURITHERM
  await prisma.sparePart.upsert({
    where: { reference: "DEL-SCTH-CAR-001" },
    update: {},
    create: {
      productId: securitherm.id,
      name: "Cartouche thermostatique 38°C",
      reference: "DEL-SCTH-CAR-001",
      description: "Cartouche thermostatique de rechange avec limiteur de température.",
      compatibility: ["DEL-SCTH-002", "DVS-THERM-001"],
      stock: 25,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DEL-SCTH-LIM-001" },
    update: {},
    create: {
      productId: securitherm.id,
      name: "Limiteur de température",
      reference: "DEL-SCTH-LIM-001",
      description: "Limiteur de température réglable 35°C à 45°C.",
      compatibility: ["DEL-SCTH-002"],
      stock: 33,
    },
  });

  // Spare Parts — BLUETEK
  await prisma.sparePart.upsert({
    where: { reference: "DEL-BLTK-CAP-001" },
    update: {},
    create: {
      productId: bluetek.id,
      name: "Capteur infrarouge",
      reference: "DEL-BLTK-CAP-001",
      description: "Module capteur infrarouge de remplacement pour robinet électronique.",
      compatibility: ["DEL-BLTK-004"],
      stock: 12,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DEL-BLTK-PIL-001" },
    update: {},
    create: {
      productId: bluetek.id,
      name: "Pile 6V lithium",
      reference: "DEL-BLTK-PIL-001",
      description: "Pile lithium 6V pour alimentation batterie robinet BLUETEK.",
      compatibility: ["DEL-BLTK-004"],
      stock: 85,
    },
  });

  // Spare Parts — KWC DOMO
  await prisma.sparePart.upsert({
    where: { reference: "KWC-DOMO-CAR-001" },
    update: {},
    create: {
      productId: domo.id,
      name: "Cartouche céramique 35mm",
      reference: "KWC-DOMO-CAR-001",
      description: "Cartouche céramique standard 35mm pour mitigeur KWC.",
      compatibility: ["KWC-DOMO-001", "KWC-ONO-002", "KWC-AVA-003"],
      stock: 67,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "KWC-DOMO-DOU-001" },
    update: {},
    create: {
      productId: domo.id,
      name: "Douchette extractible 2 jets",
      reference: "KWC-DOMO-DOU-001",
      description: "Douchette de cuisine extractible 2 fonctions jet/pluie avec flexible 1,5m.",
      compatibility: ["KWC-DOMO-001"],
      stock: 14,
    },
  });

  // Spare Parts — DVS THERMOSTAT
  await prisma.sparePart.upsert({
    where: { reference: "DVS-THERM-CAR-001" },
    update: {},
    create: {
      productId: thermostat.id,
      name: "Cartouche thermostatique DVS",
      reference: "DVS-THERM-CAR-001",
      description: "Cartouche thermostatique de remplacement pour mitigeur douche DVS.",
      compatibility: ["DVS-THERM-001"],
      stock: 20,
    },
  });

  // Spare Parts — BIOFIL
  await prisma.sparePart.upsert({
    where: { reference: "DEL-BIOF-FIL-001" },
    update: {},
    create: {
      productId: biofil.id,
      name: "Filtre de rechange 0,2 micron",
      reference: "DEL-BIOF-FIL-001",
      description: "Filtre anti-bactérien de remplacement, durée d'utilisation 30 jours, rétention 0,2 micron.",
      compatibility: ["DEL-BIOF-005"],
      stock: 95,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DEL-BIOF-RAC-001" },
    update: {},
    create: {
      productId: biofil.id,
      name: "Raccord 1/2 pouce pour filtre",
      reference: "DEL-BIOF-RAC-001",
      description: "Raccord de connexion 1/2 pouce pour montage filtre BIOFIL.",
      compatibility: ["DEL-BIOF-005"],
      stock: 40,
    },
  });

  // Spare Parts — TEMPOSOFT
  await prisma.sparePart.upsert({
    where: { reference: "DEL-TMSF-CAR-001" },
    update: {},
    create: {
      productId: temposoft.id,
      name: "Cartouche céramique temporisée",
      reference: "DEL-TMSF-CAR-001",
      description: "Cartouche de remplacement pour robinet poussoir TEMPOSOFT, temporisation fixe 8 secondes.",
      compatibility: ["DEL-TMSF-003", "DEL-TMPS-001"],
      stock: 35,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DEL-TMSF-TEP-001" },
    update: {},
    create: {
      productId: temposoft.id,
      name: "Tête de robinet poussoir complète",
      reference: "DEL-TMSF-TEP-001",
      description: "Tête complète de remplacement avec ressort et joint pour robinet TEMPOSOFT.",
      compatibility: ["DEL-TMSF-003"],
      stock: 22,
    },
  });

  // Spare Parts — DVS COMPACT
  await prisma.sparePart.upsert({
    where: { reference: "DVS-CMPT-MEM-001" },
    update: {},
    create: {
      productId: compact.id,
      name: "Membrane de chasse 1,5L",
      reference: "DVS-CMPT-MEM-001",
      description: "Membrane hydraulique de remplacement pour robinet temporisé urinoir DVS COMPACT.",
      compatibility: ["DVS-CMPT-002"],
      stock: 28,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DVS-CMPT-JNT-001" },
    update: {},
    create: {
      productId: compact.id,
      name: "Kit joints urinoir",
      reference: "DVS-CMPT-JNT-001",
      description: "Kit complet de joints (x6) pour entretien robinet urinoir DVS COMPACT.",
      compatibility: ["DVS-CMPT-002", "DVS-HYG-003"],
      stock: 60,
    },
  });

  // Spare Parts — DVS HYGIENE PRO
  await prisma.sparePart.upsert({
    where: { reference: "DVS-HYG-CAR-001" },
    update: {},
    create: {
      productId: hygiene.id,
      name: "Cartouche commande genou/coude",
      reference: "DVS-HYG-CAR-001",
      description: "Cartouche de remplacement pour commande au genou ou au coude, robinet hygiène DVS.",
      compatibility: ["DVS-HYG-003"],
      stock: 16,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "DVS-HYG-BEC-001" },
    update: {},
    create: {
      productId: hygiene.id,
      name: "Bec orientable 360°",
      reference: "DVS-HYG-BEC-001",
      description: "Bec pivotant 360° de remplacement pour robinet hygiène DVS HYGIENE PRO.",
      compatibility: ["DVS-HYG-003"],
      stock: 11,
    },
  });

  // Spare Parts — KWC ONO
  await prisma.sparePart.upsert({
    where: { reference: "KWC-ONO-ECO-001" },
    update: {},
    create: {
      productId: ono.id,
      name: "Économiseur d'eau 5L/min",
      reference: "KWC-ONO-ECO-001",
      description: "Mousseur économiseur de remplacement 5 L/min pour mitigeur lavabo KWC ONO.",
      compatibility: ["KWC-ONO-002", "KWC-DOMO-001", "KWC-AVA-003"],
      stock: 74,
    },
  });

  await prisma.sparePart.upsert({
    where: { reference: "KWC-ONO-POI-001" },
    update: {},
    create: {
      productId: ono.id,
      name: "Poignée de remplacement ONO",
      reference: "KWC-ONO-POI-001",
      description: "Poignée levier de remplacement pour mitigeur lavabo KWC ONO, finition chromée.",
      compatibility: ["KWC-ONO-002"],
      stock: 19,
    },
  });

  // Spare Parts — KWC AVA
  await prisma.sparePart.upsert({
    where: { reference: "KWC-AVA-BEC-001" },
    update: {},
    create: {
      productId: ava.id,
      name: "Bec cuisine articulé haut",
      reference: "KWC-AVA-BEC-001",
      description: "Bec haut articulé de remplacement pour robinet cuisine KWC AVA, corps laiton.",
      compatibility: ["KWC-AVA-003"],
      stock: 8,
    },
  });

  // Spare Parts — KWC INOX STAR
  await prisma.sparePart.upsert({
    where: { reference: "KWC-INOX-CAR-001" },
    update: {},
    create: {
      productId: inox.id,
      name: "Cartouche inox longue durée",
      reference: "KWC-INOX-CAR-001",
      description: "Cartouche céramique longue durée en inox 304L pour robinet collectivité KWC INOX STAR.",
      compatibility: ["KWC-INOX-004", "KWC-AVA-003"],
      stock: 31,
    },
  });

  // Sample Tickets
  await prisma.ticket.createMany({
    data: [
      {
        userId: agent.id,
        productId: tempostop.id,
        productRef: "DEL-TMPS-001",
        title: "Fuite au niveau du bouton poussoir",
        description: "Le robinet TEMPOSTOP présente une fuite importante au niveau du bouton poussoir après 2 ans d'utilisation. Besoin d'un remplacement de cartouche.",
        status: "OUVERT",
        attachments: [],
      },
      {
        userId: agent.id,
        productId: securitherm.id,
        productRef: "DEL-SCTH-002",
        title: "Température non régulée — trop chaude",
        description: "Le SECURITHERM ne régule plus la température correctement. L'eau sort à plus de 50°C malgré la limite réglée à 38°C.",
        status: "EN_COURS",
        attachments: [],
      },
      {
        userId: admin.id,
        productId: bluetek.id,
        productRef: "DEL-BLTK-004",
        title: "Capteur infrarouge défaillant",
        description: "Le robinet BLUETEK ne détecte plus la présence des mains. La LED clignote en rouge indiquant une erreur capteur.",
        status: "RESOLU",
        attachments: [],
      },
      {
        userId: agent.id,
        productId: domo.id,
        productRef: "KWC-DOMO-001",
        title: "Douchette qui fuit à la jonction",
        description: "La douchette extractible du mitigeur KWC DOMO fuit au niveau du raccord avec le flexible.",
        status: "OUVERT",
        attachments: [],
      },
      {
        userId: admin.id,
        productId: thermostat.id,
        productRef: "DVS-THERM-001",
        title: "Remplacement cartouche thermostatique",
        description: "Demande de remplacement préventif de la cartouche thermostatique DVS après 5 ans d'utilisation en établissement de santé.",
        status: "FERME",
        attachments: [],
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed terminé avec succès");
  console.log("   Utilisateurs: admin@partiq.fr / agent@partiq.fr");
  console.log("   Marques: DELABIE, KWC, DVS");
  console.log("   Produits: 11 | Pièces détachées: 11 | Tickets: 5");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
