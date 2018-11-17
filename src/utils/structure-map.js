import Controller from '../structures/Controller';
import Extension from '../structures/Extension';
import Link from '../structures/Link';
import Spawn from '../structures/Spawn';
import Tower from '../structures/Tower';
import Wall from '../structures/Wall';
import Rampart from '../structures/Rampart';

const oldStructureMap = {
  [STRUCTURE_EXTENSION]: Extension,
  [STRUCTURE_LINK]: Link,
  [STRUCTURE_RAMPART]: Rampart,
  [STRUCTURE_SPAWN]: Spawn,
  [STRUCTURE_TOWER]: Tower,
  [STRUCTURE_WALL]: Wall,
};

const newStructureList = [
  Controller,
];

export default newStructureList.reduce((acc, StructureClass) => {
  acc[StructureClass.structureType] = StructureClass;
  return acc;
}, oldStructureMap);
