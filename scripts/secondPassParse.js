// Global variables
    var tree;
    var verb;
    var currScope;
    var CST;
    var queue;
    var scopeQueue

function secondPassParse(verbose, inCST)
{
    levelIn++;
    
    //Initialize gloal vars
	    
	verb = verbose;
	CST = inCST;
    tree = new SyntaxTree(null, "NEWSCOPE", null);
    queue = new Array();
    scopeQueue = new Array();
    
	    
    putMessage("Started Second Pass Parsing");
    buildQueue(inCST);
    queue.push(new Wrapper("END", ""));//Create the base
    
    if(verb){
        var result = "Queue For AST: ";
        for(var i=0; i<queue.length;i++){
            result += "["+queue[i].type+"]";
        }
        putMessage(result);
    }
	
    //Report the results.
    processOne();
  
	
    putMessage("Finished Second Pass Parsing");
	levelIn--;

    putMessage("CST:");
    printTree(tree);
	    
	return tree;
}

function buildQueue(CST){
    var numChildren = CST.children.length;
    var specialRege = /NEWSCOPE|printState|idState|varDecl/;
    
    if(numChildren == 0){//this is a leaf, push it on the queue
        queue.push(new Wrapper(CST.type, CST.token));
    }
    else if(CST.type == "B_stringExpr"){
        var string = makeString(CST.children[0]);
        queue.push(new Wrapper(string.type, string));
    }
    else{
        if(specialRege.test(CST.type)){
            queue.push(new Wrapper(CST.type, ""));
        }
        
        if(numChildren == 3){
            buildQueue(CST.children[1]);
            buildQueue(CST.children[0]);
            buildQueue(CST.children[2]);
        }
        else{
            buildQueue(CST.children[0]);
            if(numChildren == 2){
                buildQueue(CST.children[1]);
            }
        }
    }

}


function processOne(){
    var currItem = queue.shift();
    var currType = currItem.type;
    var currToken = currItem.token;
    var oneChildRege = /printState/;
    var twoChildRege = /idState|varDecl|_plus$|_sub$/;
    
    if(oneChildRege.test(currType)){
        if(verb)
            putMessage("AST processing branch with one child");
        tree = tree.addChild(currType, currToken);
        processOne();
        tree = tree.parentRef();
    }
    else if(twoChildRege.test(currType)){
        if(verb)
            putMessage("AST processing branch with two child");
        tree = tree.addChild(currType, currToken);
        processOne();
        processOne();
        tree = tree.parentRef();
    }
    else if(currType == "NEWSCOPE"){
        if(verb)
            putMessage("AST processing Newscope branch");
        tree = tree.addChild(currType, currToken);
        var peek = queue.shift();
        queue.unshift(peek);
        while(peek.type != "ENDSCOPE"){
            processOne();
            peek = queue.shift();
            queue.unshift(peek);
        }
        queue.shift();
        tree = tree.parentRef();
    }
    else if(/^T_/.test(currType)){
        if(verb)
            putMessage("AST processing leaf node");
        tree.addChild(currType, currToken);
    }
    else if(currType == "END"){
        putMessage("ERROR: AST hit END. AST should never hit END");
    }
    
}

function makeString(charList){
    var string = new T_string(0,0);
    if(charList.children.length == 2){
        string.line = charList.children[0].line;
        string.column = charList.children[0].column;
    }
    string.inside = makeStringHelper(charList);    
    return string;   
}

function makeStringHelper(charList){
    var result = "";
    if(charList.children.length == 2){
        result = charList.children[0].token.inside+makeStringHelper(charList.children[1]);
    }
    
    return result;
}


/*
// in ID ASSIGN
    else if(validId) //There is a valid id and expr, attempt to go through with the assignment
	{
		var ident = idParse.idT.inside;
		var value = exprParse;
		if(symTable.hasItem(ident))
		{
			var existingVar = symTable.getItem(ident); //Retrieve the existing symbol defition to not overwrite it
			existingVar.value = value; //Set the new value
			symTable.setItem(ident, existingVar); //Put the symbol back in the table
		}
		else //This is a previously unseen variable, cannot be assigned until it is declared
		{
			putMessage("Found undeclared variable assignment at " + idParse.idT.line +":" +idParse.idT.column);
			errors.push(new B_error("B_idState", "Declared user id", new T_errorP("declared user id", idParse.idT), idParse.size));
			errorCount++;
			//var newVar = new variable(undefined, value);
			//symTable.setItem(ident, newVar); //Put the new symbol back in the table
		}
	}
	
	
// in VAR DECL
	
		else if(validId) // this is a valid variable declaration. Add to the symbol table
	{
		var ident = idParse.idT.inside;
		var type = typeMatch.inside;
			
		if(symTable.hasItem(ident))
		{
			var existingVar = symTable.getItem(ident); //Retrieve the existing symbol defition to not overwrite it
			existingVar.type = type; //Set the new value
			symTable.setItem(ident, existingVar); //Put the symbol back in the table
		}
		else //This is a previously unseen variable, needs to be created
		{
			var newVar = new variable(type, "");
			symTable.setItem(ident, newVar); //Put the new symbol back in the table
		}
	}
*/