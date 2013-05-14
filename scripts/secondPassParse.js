// Global variables
    var tree;
    var verb;
    var scopeTree;
    var errors;
    var CST;
    var queue;

    
    //Constants
    var typeRege =/int|string|boolean/;
    var intExprRege = /T_digit|_sub$|_plus$|int/;
    var boolExprRege = /_eqComp$|_bool|boolean/;
    var stringExprRege = /_string$|string/;
    var intOpRege = /_sub$|_plus$/;
    var compRege = /_eqComp$/;
    var oneChildRege = /printState/;
    var twoChildRege = /idState|varDecl|while|if|_plus$|_sub$|_eqComp/;
    
    

function secondPassParse(verbose, inCST)
{
    levelIn++;
    
    //Initialize gloal vars
	verb = verbose;
	CST = inCST;
    tree = new SyntaxTree(null, "NEWSCOPE", null);
    scopeTree = new ScopeTree(null);
    errors = new ErrorHandler();
    queue = new Array();
    
    
	    
    putMessage("Started Second Pass Parsing");
    buildQueue(inCST);
    
    if(verb){
        var result = "Queue: ";
        for(var i=0; i<queue.length;i++){
            result += "["+queue[i].type+"]";
        }
        putMessage(result+"\n");
    }
	
    
    buildSymTable();
    putMessage("Symbol tree built with "+errors.errorCount()+" errors.");
    gbScopeTree = scopeTree;
   
   processOne();
	
    //Report the results.
    putMessage("Finished Second Pass Parsing");
	levelIn--;

    errors.print();
    putMessage("AST:");
    tree.print();
    scopeTree.print();
    
    if(errors.errorCount() > 0)
        anyErrors = true;
    
	    
	return tree;
}

function buildQueue(CST){
    var numChildren = CST.children.length;
    var specialRege = /NEWSCOPE|printState|idState|varDecl|whileState|ifState/;
    
    //putMessage("Queing "+CST.type);
    
    if(numChildren == 0){//this is a leaf, push it on the queue
        queue.push(CST.token);
    }
    else if(CST.type == "B_stringExpr"){
        var string = makeString(CST.children[0]);
        queue.push(string);
    }
    else{
        if(specialRege.test(CST.type)){
            queue.push(CST.token);
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



function buildSymTable(){
    var currItem;
    for(var i=0;i<queue.length;i++){
        currItem = queue.shift();
        //putMessage("In loop. Type: "+currItem.type+" i: "+ i);
        
        if(currItem.type == "B_varDecl" ){
            var typeWrap = queue.shift();
            var idWrap = queue.shift();
            
            var type = typeWrap.inside;
            var id = idWrap.inside;

    		var previous = scopeTree.localHas(id)
            var newVar = new variable(type, id, typeWrap.line, typeWrap.column);
            newVar.alias = ""+i;
            //Add it to the symbol table
    		if(previous == null)//This is a new variable, declare it if the type is valid
    		{
                if(!typeRege.test(type)){//invalid type
                    errors.add(type,id,20,typeWrap.line, typeWrap.column);
                }
                scopeTree.setVar(id, newVar);
                idWrap.entry = newVar;
    		}
    		else //The variable is declared in the local scope. Push error, overwrite
    		{
                errors.add(previous.type," "+id,21,typeWrap.line, typeWrap.column);
    			scopeTree.setVar(id, newVar); //Put the symbol back in the table
    		}
            
            queue.push(currItem);
            queue.push(typeWrap);
            queue.push(idWrap);
            
            i += 2;
            
        }
        else {
            if(currItem.type=="B_idState"){
                var idWrap = queue.shift();
    			var valWrap = queue.shift();
                queue.unshift(valWrap);
                queue.unshift(idWrap);
                
                var id = idWrap.inside;
    
            	var previous = scopeTree.member(id);
                
                //Update the symbol table
        		if(previous != null)//This is an existing variable. Type check and update
        		{
                    var typeVal = typeCheck(scopeTree, previous.type, valWrap);
                    if(typeVal != null){
                        var newVar = new variable(previous.type, id, idWrap.line, idWrap.column);
                        if(previous.used)
                            previous.tree.setVar(id+previous.alias, previous);
                        
                        newVar.init = true;
                        newVar.alias = ""+i;
                        previous.tree.setVar(id, newVar);
                    }
                    else
                        errors.add(id+"=",valWrap.inside,23,idWrap.line, idWrap.column);
        		}  
        		else //The variable isn't declared in this scope. Push error
        		{
                    errors.add("",id,24,idWrap.line, idWrap.column);
        		}
                
                
                
            }
            else if(intOpRege.test(currItem.type)){
                var digitWrap = queue.shift();
        		var exprWrap = queue.shift();
                queue.unshift(exprWrap);
                queue.unshift(digitWrap);
                
                var expr = exprWrap.inside;
                var typeVal = typeCheck(scopeTree, "int", exprWrap);
                if(typeVal == null){
                    errors.add(digitWrap.inside,currItem.inside+exprWrap.inside,22,digitWrap.line, digitWrap.column);
                }
            }
            else if(compRege.test(currItem.type)){
                var firstExprWrap = queue.shift();
            	var secondExprWrap = queue.shift();
                queue.unshift(secondExprWrap);
                queue.unshift(firstExprWrap);
                
                
                var leftType;
                var rightType;
                
                if(firstExprWrap.type == "T_userId"){
                    var assignVar = scopeTree.member(firstExprWrap.inside);
                    if(assignVar != null){
                        leftType = assignVar.type;
                    }
                    else{
                        errors.add("",firstExprWrap.inside,23, firstExprWrap.line, firstExprWrap.column);
                        leftType = "unknown";
                   }
                }
                else
                    leftType = firstExprWrap.type
                
                var typeVal = typeCheck(scopeTree, leftType, secondExprWrap);
                
                if(typeVal == null){
                    errors.add(firstExprWrap.inside,currItem.inside+secondExprWrap.inside,22,firstExprWrap.line, firstExprWrap.column);
                }
            }
            else if(currItem.type == "NEWSCOPE"){
                scopeTree = scopeTree.newScope();
            }
            else if(currItem.type == "ENDSCOPE"){
                scopeTree = scopeTree.closeScope();
            }
            else if(currItem.type == "T_userId"){
                var currVar = scopeTree.member(currItem.inside);
                if(currVar != null){
                    currItem.entry = currVar;
                    currVar.used = true;
                    currItem.entry = currVar;
                    if (!currVar.init) {
                        errors.add(currItem.inside,"",54,currVar.line, currVar.column);    
                    }
                }
                else{
                    errors.add("",currItem.inside,24,currItem.line, currItem.column);
                }
            }
        
            queue.push(currItem);
        }
    }
    
    punishUnused(scopeTree);
    
}


function processOne(){
    levelIn++
    var currItem = queue.shift();
    var currType = currItem.type;
    
    if(oneChildRege.test(currType)){
        if(verb)
            putMessage("AST processing branch with one child");
        tree = tree.addChild(currType, currItem);
        processOne();
        tree = tree.parentRef();
    }
    else if(twoChildRege.test(currType)){
        if(verb)
            putMessage("AST processing branch with two children");
        tree = tree.addChild(currType, currItem);
        processOne();
        processOne();
        tree = tree.parentRef();
    }
    else if(currType == "NEWSCOPE"){
        if(verb)
            putMessage("AST processing Newscope branch");
        tree = tree.addChild(currType, currItem);
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
        tree.addChild(currType, currItem);
    }
    else if(currType == "END"){
        putMessage("ERROR: AST hit END. AST should never hit END");
    }
    
    levelIn--;
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


function typeCheck(sTree, type, val){    
    var result = null;
    
    if(val != undefined){
        //putMessage("Type Chekain. type:"+type+". val: "+val.inside+" val.type "+val.type)

        if(val.type == "T_userId"){
        
             var assignVar = sTree.member(val.inside);
             if(assignVar != null){
                 result = typeCheck(sTree, type, assignVar);
             }
             else{
                errors.add("",val.inside,23,val.line, val.column);
             }
         }
         else if((type == val.type) || 
                (intExprRege.test(type) && intExprRege.test(val.type))|| 
                (stringExprRege.test(type) && stringExprRege.test(val.type))||
                (boolExprRege.test(type) && boolExprRege.test(val.type))){
            result =val;
        }
    }
    
    return result;
}


function punishUnused(sTree){
    var identifiers = sTree.symTable.keys();
    
	for(var i=0;i<identifiers.length;i++){
        var currVar = sTree.symTable.items[identifiers[i]];
        if(!currVar.used)
	        errors.add(identifiers[i],"",53,currVar.line, currVar.column);	
	}
    
    
    for (var i = 0; i < sTree.children.length; i++) {
        punishUnused(sTree.children[i]);
    }
}