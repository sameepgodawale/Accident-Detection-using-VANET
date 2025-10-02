#include <iostream>
#include "decision_tree_rules.h"

void test_case(float acc,float gyro,float vib,float it,bool airbag,float wd){
    std::cout<<"acc="<<acc<<" gyro="<<gyro<<" vib="<<vib<<" it="<<it<<" airbag="<<airbag<<" wd="<<wd<<" => "<<classifySeverity(acc,gyro,vib,it,airbag,wd)<<"\n";
}
int main(){
    test_case(2.0,5.0,0.1,0.05,false,-1);
    test_case(9.0,30.0,0.8,0.6,false,0.2);
    test_case(13.0,10.0,1.4,1.0,false,0.8);
    test_case(6.0,85.0,0.5,0.4,false,-1);
    test_case(4.0,3.0,0.2,0.03,true,-1);
    return 0;
}
