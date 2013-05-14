// Global variables
    var verb;
    var scopeTree;
    var AST;
    var table;
    var output;
    var stackEnd;
    var heapEnd;

    
    // //Constants
    // var typeRege =/int|string/;
    // var intExprRege = /T_digit|_sub$|_plus$/;
    // var intOpRege = /_sub$|_plus$/;
    // var oneChildRege = /printState/;
    // var twoChildRege = /idState|varDecl|_plus$|_sub$/;
    
    

function codeGen(verbose, inAST)
{
    levelIn++;
    
    //Initialize gloal vars
    verb = verbose;
	AST = inAST.children[0];
    scopeTree = gbScopeTree;
    table = new HashTable();
    stackEnd = 0;
    heapEnd =255;
    
    output = new Array(256);
    for(var i=0; i<output.length;i++){
        output[i] = "00";
    }
    
    
	    
    putMessage("Started Code Generation");
    buildState();
    stackEnd++;
    backTrack();
    pad();
    
    memDump();

	    
	return tree;
}

function buildState(){
    levelIn++
    
    var type = AST.type;
    
    switch(type){
    	case "NEWSCOPE":
            if(verb)
                putMessage("New Scope");
            for(var i =0;i< AST.children.length; i++){
                if(verb)
                    putMessage("Processing Child "+i)
                AST = AST.children[i];
                buildState();
                AST = AST.parentRef();
                //memDump();
            }
			break;
   
        case "B_printState":
            buildPrint();
            break;       
           
        case "B_idState":
            buildAssign();
            break;        
           
        case "B_varDecl":
            //buildDecl();
            break;
        case "B_ifState":
            buildIf();
            break;  
        case "B_whileState":
            buildWhile();
            break;  
    }
    levelIn--;
}

/*function buildDecl(){
    levelIn++
    if(verb)
        putMessage("Processing a Variable declaration Statement");
    
    putMessage("Adding alias: "+AST.children[1].token.entry.name+" "+AST.children[1].token.entry.alias)
    var alias = AST.children[1].token.entry.alias;
    putMessage("Adding alias: "+alias)
    table.setItem(alias, undefined);
    levelIn--;
}*/


function buildAssign(){
    levelIn++
    if(verb)
        putMessage("Processing an Assign Statement");
    
    var idToken = AST.children[0].token;
    var type = idToken.entry.type;
    var alias = idToken.entry.alias;
    
    //Add an entry in the table
    if(!table.hasItem(alias)){
        table.setItem(alias, undefined); 
    }
    
    
    switch(type){
        case "int":
            AST = AST.children[1];
            buildIntExpr(); //Loads its result in the accumulator
            AST = AST.parentRef();
            
            output[stackEnd] = "8D";
            stackEnd++;
            output[stackEnd] = "TT"+alias;
            stackEnd++;
            output[stackEnd] = "00";
            stackEnd++;
			break;
        case "string":
            AST = AST.children[1];
    		var loc = putString(); //returns the location
            AST = AST.parentRef();
            
            table.setItem(alias, loc);
            
            //Store it
            if(table.hasItem(alias)){
                table.setItem(alias, loc); 
            }
    		break;
        case "boolean":
            AST = AST.children[1];
    		buildBoolExpr(); //Loads its result in the accumulator
            AST = AST.parentRef();
            
            output[stackEnd] = "8D";
            stackEnd++;
            output[stackEnd] = "TT"+alias;
            stackEnd++;
            output[stackEnd] = "00";
            stackEnd++;
    		break;
    }
    
    levelIn--;
}


function buildIntExpr(){
    levelIn++
    if(verb)
        putMessage("Processing an int expression");
    
    if(AST.type == "T_digit"){ //Constant
        output[stackEnd] = "A9";
        stackEnd++;
        output[stackEnd] = AST.token.inside.toString(16);
        stackEnd++;
    }
    else if(AST.type == "T_userId"){
        buildId();
    }
    else {//Going to have to evaluate more
        if(AST.type == "T_sub")
            putMessage("Subtraction not supported. Going to pretend that was a plus");
        
        AST = AST.children[1];
        buildIntExpr(); //Loads its result in the accumulator
        AST = AST.parentRef();
        
        output[stackEnd] = "8D";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        
        AST = AST.children[0];
        buildIntExpr(); //Loads its result in the accumulator
        AST = AST.parentRef();
        
        output[stackEnd] = "6D";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
    }
    
    levelIn--;
}


function buildBoolExpr(){
    levelIn++
    if(verb)
        putMessage("Processing a bool expression");
        
    //putMessage("AST.type: "+AST.type)
    
    if(AST.type == "T_bool"){ //Constant
        var result = AST.token.inside;
        output[stackEnd] = "A9";
            stackEnd++;
        if(AST.token.inside = "true"){
            output[stackEnd] = "01";
            stackEnd++;
        }
        else{
            output[stackEnd] = "00";
            stackEnd++;
        }
    }
    else if(AST.type == "T_userId"){
        buildId();
    }
    else{//Going to have to evaluate more
        AST = AST.children[0];
        buildExpr(); //Loads its result in the accumulator
        AST = AST.parentRef();
        
        //Save it in the middle space
        output[stackEnd] = "8D";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        
        AST = AST.children[1];
        buildExpr(); //Loads its result in the accumulator
        AST = AST.parentRef();
        
        output[stackEnd] = "AE";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        //The left side is now in the X register
        
        output[stackEnd] = "8D";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        //The right side is now at WSXX
        
        output[stackEnd] = "EC";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        //The Z flag is now either set(not equal),  or not(equal)
        
        
        output[stackEnd] = "D0";
        stackEnd++;
        output[stackEnd] = "05"; // Jump to second A9
        stackEnd++;
        output[stackEnd] = "A9";
        stackEnd++;
        output[stackEnd] = "01";
        stackEnd++;
        output[stackEnd] = "D0";
        stackEnd++;
        output[stackEnd] = "03"; //Jump past loading 00 into the acc
        stackEnd++;
        output[stackEnd] = "A9";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;   
    }
    
    levelIn--;
}


function buildId(){
    levelIn++
    if(verb)
        putMessage("Processing a user Id");
    
    var alias = AST.token.entry.alias;
    output[stackEnd] = "AD";
    stackEnd++;
    output[stackEnd] = "TT"+alias;
        
    stackEnd++;
    output[stackEnd] = "00";
    stackEnd++;
    
    levelIn--;
}


function putString(){
    levelIn++
    if(verb)
        putMessage("Popping some string data into memory");
    
    var inData = AST.token.inside;
    var data = inData.split("");
    var length = data.length;
    for(var i =0; i<length; i++){
        output[heapEnd-(length-i)] = data[i].charCodeAt().toString(16);
    }
    output[heapEnd] = "00";
    heapEnd = heapEnd -(length+1);

    levelIn--;
    return (heapEnd+1);
}


function buildPrint(){
    levelIn++
    if(verb)
        putMessage("Processing a Print Statement");
    
    var yReg;
    var xReg;
    var child = AST.children[0];
    
    if(child.type == "T_userId"){// test for type, deal with it appropriately
        var varType = child.token.entry.type;
        var alias = child.token.entry.alias;
            
        output[stackEnd] = "AC";
        stackEnd++;
        output[stackEnd] = "TT"+alias;
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        output[stackEnd] = "A2";
        stackEnd++;
        
        if(/int|boolean/.test(varType)){
            output[stackEnd] = "01";
            stackEnd++;            
        }
        else{
            output[stackEnd] = "02";
            stackEnd++;
        }
        output[stackEnd] = "FF";
            stackEnd++;
    }
    else if(/_plus$|_sub$|_digit$/.test(child.type)){
        AST = child;
        buildIntExpr(); //Loads its result in the accumulator
        AST = AST.parentRef();
        
        output[stackEnd] = "8D";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        output[stackEnd] = "AC";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        output[stackEnd] = "A2";
        stackEnd++;
        output[stackEnd] = "01";
        stackEnd++;
        output[stackEnd] = "FF";
        stackEnd++; 
    }
    
    else if(/_false$|_true$|_eqComp$/.test(child.type)){
        AST = child;
        buildBoolExpr(); //Loads its result in the accumulator
        AST = AST.parentRef();
        
        output[stackEnd] = "8D";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        output[stackEnd] = "AC";
        stackEnd++;
        output[stackEnd] = "TTWS";
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        output[stackEnd] = "A2";
        stackEnd++;
        output[stackEnd] = "01";
        stackEnd++;
        output[stackEnd] = "FF";
        stackEnd++; 
    }
    
    else if(child.type == "T_string"){
        AST = child;
        var loc = putString(); //Loads its location 
        AST = AST.parentRef();

        output[stackEnd] = "A0";
        stackEnd++;
        output[stackEnd] = loc.toString(16);
        stackEnd++;
        output[stackEnd] = "00";
        stackEnd++;
        output[stackEnd] = "A2";
        stackEnd++;
        output[stackEnd] = "02";
        stackEnd++;
        output[stackEnd] = "FF";
        stackEnd++; 
    }
    
    levelIn--;
}


function buildIf(){
    levelIn++
    if(verb)
        putMessage("Processing an If Statement");
        
    var jumpStart;
    
    AST = AST.children[0];
    buildBoolExpr(); //Loads its result in the accumulator
    AST = AST.parentRef();
    
    //Save the result in the workspace
    output[stackEnd] = "8D";
    stackEnd++;
    output[stackEnd] = "TTWS";
    stackEnd++;
    output[stackEnd] = "00";
    stackEnd++;
    
    //Load 1 (true) into the x reg
    output[stackEnd] = "A2";
    stackEnd++;
    output[stackEnd] = "01";
    stackEnd++;
    
    //Compare
    output[stackEnd] = "EC";
    stackEnd++;
    output[stackEnd] = "TTWS";
    stackEnd++;
    output[stackEnd] = "00";
    stackEnd++;
    
    //Set up the jump; we'll fill this in in a momment
    output[stackEnd] = "D0";
    stackEnd++;
    jumpStart = stackEnd;
    output[stackEnd] = "";
    stackEnd++;
    
    //If it's true, this will be evaluated
    AST = AST.children[1];
    buildState();
    AST = AST.parentRef();
    
    // Fill in the jump distance
    output[jumpStart] = (stackEnd-jumpStart-1).toString(16);
    levelIn--;
}


function buildWhile(){
    levelIn++
    if(verb)
        putMessage("Processing a While Statement");
    
    var loopStart =stackEnd;
    var jumpStart;
    
    AST = AST.children[0];
    buildBoolExpr(); //Loads its result in the accumulator
    AST = AST.parentRef();
    
    //Save the result in the workspace
    output[stackEnd] = "8D";
    stackEnd++;
    output[stackEnd] = "TTWS";
    stackEnd++;
    output[stackEnd] = "00";
    stackEnd++;
    
    //Load 1 (true) into the x reg
    output[stackEnd] = "A2";
    stackEnd++;
    output[stackEnd] = "01";
    stackEnd++;
    
    //Compare
    output[stackEnd] = "EC";
    stackEnd++;
    output[stackEnd] = "TTWS";
    stackEnd++;
    output[stackEnd] = "00";
    stackEnd++;
    
    //Set up the jump; we'll fill this in in a momment
    output[stackEnd] = "D0";
    stackEnd++;
    jumpStart = stackEnd;
    output[stackEnd] = "";
    stackEnd++;
    
    //If it's true, this will be evaluated
    AST = AST.children[1];
    buildState();
    AST = AST.parentRef();
    
    //To loop we have to reset the z flag, then go around the 248 mark and back again
    output[stackEnd] = "EC";
    stackEnd++;
    output[stackEnd] = stackEnd.toString(16);
    stackEnd++;
    output[stackEnd] = "00";
    stackEnd++;
    output[stackEnd] = "D0";
    stackEnd++;
    output[stackEnd] = (loopStart+255-stackEnd).toString(16);
    stackEnd++;
    
    // Fill in the jump distance
    output[jumpStart] = (stackEnd-jumpStart-1).toString(16);
    
    levelIn--;
}


function buildExpr(){
    levelIn++;
    
    var type = AST.type;

    
    
    if(/_intExpr|_intExprWOp/.test(type)){
        buildIntExpr();
    }
    /*else if(/_stringExpr/.test(type)){
        buildIntExpr();
    }*/
    else if("T_userId" == type){
        buildId();
    }
    else if(/_bool|_eqComp/.test(type)){
        buildBoolExpr();
    }
    
    levelIn--;
    
}


function backTrack(){
    levelIn++;
    if(verb)
        putMessage("Backtracking correct addresses")
    var identifiers = table.keys();
    var varObjs = table.values(); 
    
    //Create space for each variable
    if(identifiers.length > 0){
        for(var i=0;i<identifiers.length;i++){
            //putMessage("varObjs[i]: "+varObjs[i])
    		if(varObjs[i] != undefined){//string
        	    output[stackEnd] = varObjs[i].toString(16);
                table.setItem(identifiers[i], stackEnd.toString(16));
    		}
            else{
                //putMessage("Looking at "+identifiers[i]+" at "+stackEnd.toString(16))
                table.setItem(identifiers[i], stackEnd.toString(16));
            }
                stackEnd++;
    	}
    }
    var workSpace = stackEnd.toString(16);
    stackEnd++;

    for(var j =0;j <output.length; j++){
        if(output[j].length > 2){
            var name = output[j].substring(2);
            if(table.hasItem(name)){
                output[j] = table.getItem(name);
            }
            else if(name == "WS"){
                output[j] = workSpace;
            }
        }
    }
    
    
    
    
    levelIn--;
}

function pad(){
    for(var j =0;j <output.length; j++){
        if(output[j].length < 2){
            output[j] = "0"+output[j];
        }
    }
}



function memDump(){
    var identifiers = table.keys();
    var varObjs = table.values();

    if(verb){
        if(identifiers.length > 0){
        	for(var i=0;i<identifiers.length;i++){
        		document.getElementById("taOutput").value += identifiers[i]+" at "+varObjs[i]+"\n";
        	}
        }
    }
    
    for(var i =0; i<output.length; i++){
    if(i%8 == 0){
        document.getElementById("taCode").value += "\n";
    }
    document.getElementById("taCode").value += output[i];
    }
    
}






/*
function printBool(val){
    var yReg;
    
    if(child.type == "T_false"){
            if(falseLoc > 0){
                yReg = falseLoc;
            }
            else{
                output[heapEnd-5] = "f";
                output[heapEnd-4] = "a";
                output[heapEnd-3] = "l";
                output[heapEnd-2] = "s";
                output[heapEnd-1] = "e";
                output[heapEnd] = "00";
                heapEnd = heapEnd-6;
                yReg = heapEnd+1;
                falseLoc = loc;
            }
        }
        else if(child.type == "T_true"){
            if(trueLoc > 0){
                yReg = trueLoc;
            }
            else{
                output[heapEnd-4] = "t";
                output[heapEnd-3] = "r";
                output[heapEnd-2] = "u";
                output[heapEnd-1] = "e";
                output[heapEnd] = "00";
                heapEnd = heapEnd-5;
                yReg = heapEnd+1;
                trueLoc = loc;
            }
        }
        
    return yReg
}*/






/*function (){
    levelIn++
    
    var type = AST.type;
    
    levelIn--;
}*/







//Trash
/*
    		//Load the data
            output[stackEnd] = "AD";
            stackEnd++;
            output[stackEnd] = "TTWS";
            stackEnd++;
            output[stackEnd] = "00";
            stackEnd++;




*/



