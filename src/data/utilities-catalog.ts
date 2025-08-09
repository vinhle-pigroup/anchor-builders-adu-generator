export type CatalogItem = {
  key: string;
  label: string;
  description: string;
  price?: number; // utilities usually no price—leave if you decide to price them later
};

export const UtilitiesCatalog: CatalogItem[] = [
  { key: 'water',   label: 'Water Connection',   description: 'Tie-in or new lateral; trenching and shutoff as required.' },
  { key: 'sewer',   label: 'Sewer Connection',   description: 'Main tie-in; cleanout per jurisdiction.' },
  { key: 'gas',     label: 'Gas Line',           description: 'Supply from main; shutoff and regulator.' },
  { key: 'electric',label: 'Electric Meter',     description: 'New or sub-meter; panel coordination with utility.' },
];