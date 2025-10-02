#include <iostream>
#include "decision_tree_rules.h"
int main() {
    float acc = 11.0f; float gyro = 30.0f; float vib = 0.9f; float it = 0.5f; bool airbag=false; float wd = 0.0f;
    std::string s = classifySeverity(acc, gyro, vib, it, airbag, wd);
    std::cout << "Predicted severity: " << s << std::endl;
    return 0;
}
