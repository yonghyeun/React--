const NoFlags = /*                      */ 0b0000000000000000000000000000;
const PerformedWork = /*                */ 0b0000000000000000000000000001;
const Placement = /*                    */ 0b0000000000000000000000000010;
const Update = /*                       */ 0b0000000000000000000000000100;

let SomeFlag = NoFlags;
SomeFlag |= PerformedWork;

console.log(SomeFlag & Update);
