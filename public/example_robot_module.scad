include <module_connector.scad>

length = 50;


// Module connector
translate([0,0,length])
module_connector();

translate([0,0,-6])
module_connector();



difference(){
    cylinder(length, 40/2, 40/2);

    // Cut for assemble
    cube([length*2, 0.1, length*2], true);

    //Screw holes
    for(i=[0:1])
    mirror([i,0,0])
    translate([40/2,-2.5,length/2])
    rotate([90,0,0]){
        cylinder(length, d=15);
        translate([-3,0,-1])
        cylinder(2, d1=3.1, d2=6);

        #translate([-3,0,-25])
        cylinder(50, d=3.1);

        translate([-4,-3,-5-2.8])
        cube([10,5.8,2.8]);
    }
}
