// Global variables
    var tree;
    var verb;
    //var currScope;
    //var errorCount;
    var errors;
    
    
function firstPassParse(verbose)
{
    levelIn++;
    
	//Initialize gloal vars
	errors = new ErrorHandler();
	    
	verb = verbose;
	
	    
    putMessage("Started First Pass Parsing");
	parseProgram();
	
    //Report the results.
    putMessage("First Pass Parsing Completed with "+errors.errorCount()+" errors.");
	    
	levelIn--;

	errors.print();
    putMessage("CST:");
    tree.print();
    
    if(errors.errorCount() > 0)
        anyErrors = true;

	return tree;
}


function parseProgram()
    {
	levelIn++;
	    
	if(verb)
	    putMessage("Attempting to parse program");
	var index = 0;
	var result;
	tree = new SyntaxTree(null, "B_program", "");
	    
	if(tokens[index].type != "T_BOF") //This is not a validly lexed program
	{
		errors.add(tokens[index].type,"T_BOF",52,0,0);
	}
	else //The beginning is lexographically sound, skip the BOF
		index++; 
	
    var statementParse = parseStatement(index);
	result = new B_program(statementParse.size, statementParse);
    tree.token = result;
	
	putMessage("Program parsed");
	
	levelIn--;
	return result;
}


function parseStatement(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse statement");
	    
	var result;
	//tree = tree.addChild("Statement", "");
	    
	//Try to parse
	currToken = tokens[index];
	switch(currToken.type){
		case "T_print":
			result = parsePrintState(index);
			break;
		case "T_userId":
			result = parseIdState(index);
			break;
		case "T_type":
			result = parseVarDecl(index);
			break;
		case "T_openSBracket":
			result = parseStatementListState(index);
			break;
        case "T_while":
    		result = parseWhileState(index);
			break;
        case "T_if":
    		result = parseIfState(index);
			break;
		default: //None of those matched
			errors.add(currToken.type,"Start to a statement",10,currToken.line, currToken.column);
			//putMessage("Error: Expected the start to a statement at " +currToken.line+ ":" +currToken.column+". Found " +currToken.type +".");
			//errorCount++;
			var currError = new B_error("B_statement", "Start to a statement", matchToken("start to a statement", index), 1);
			//errors.push(currError);
			result = currError;
			break;
		}
	
	
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a statement");
		else
			putMessage("Statement parsed");
	}
	
	levelIn--;
	//tree = tree.parentRef();
	return result;
    }

  
function parsePrintState(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse print statement");
	
	var result;
	tree = tree.addChild("B_printState", "");
	var startIndex = index;
	index++; //skip the print that has already been read
	
	var openParenMatch = matchToken("T_openParen", index);
	if(openParenMatch.type =="T_errorP")//The next token is not an open paren. Assume it's missing
	{
		errors.add(openParenMatch.found.type, "T_openParen", 10, openParenMatch.found.line, openParenMatch.found.column);
		//putMessage("Error: Expected an open parenthesis after the print operator. Found "+openParenMatch.found.type+" at " +openParenMatch.found.line+":"+openParenMatch.found.column+"Will attempt to continue parsing");
		//errorCount++;
		//errors.push(new B_error("B_printState", "T_openParen", openParenMatch, 1));
	}
	else
		index++; //skip the open paren
        
	
	var exprParse = parseExpr(index);
	index+= exprParse.size;
	
	var closeParenMatch = matchToken("T_closeParen", index);
	index++;
	if(closeParenMatch.type =="T_errorP")//The next token is not a close paren. Look for the next close paren and throw out anything in between
	{
		putMessage("Error: Expected a close parenthesis after the statement. Found "+closeParenMatch.found.type+" at "+closeParenMatch.found.line+":"+closeParenMatch.found.column);
		//errorCount++;
		//errors.push(new B_error("B_printState", "T_closeParen", closeParenMatch, 1));
		errors.add(closeParenMatch.found.type, "T_closeParen", 10, closeParenMatch.found.line, closeParenMatch.found.column);
		
		var nextClose = findNext("T_closeParen","T_openParen",index);
		if(nextClose != -1)
		{
			putMessage("   Found a close parenthesis at "+tokens[nextClose].line+ ":"+tokens[nextClose].column+". Will resume parsing from there");
			index = nextClose+1;
		}
		else //There are no more close parens
		{
			putMessage("   Did not find a close paren for print statement. Will resume parsing from"+" at "+closeParenMatch.found.line+":"+closeParenMatch.found.column);
		}
	}
	
	result = new B_printState(index-startIndex, exprParse);
	tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a print statement");
		else
			putMessage("Print statement parsed");
	}
	
	levelIn--;
	tree = tree.parentRef();
	return result;
}


function parseIdState(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse id assignment statement");
	    
	var result;
	tree = tree.addChild("B_idState", "");
	var startIndex = index;
	var validId = false;
	    
	var idParse= parseId(index);
	index+= idParse.size;
	if(idParse.type == "B_error") // This was not a valid id
	{
		errors.add(idParse.found.type, "user Id", 10, idParse.found.line, idParse.found.column);
		//putMessage("Error: Expected a user id. Found "+idParse.found.type+"at "+idParse.found.line+":"+idParse.found.column+". Will attempt to continue parsing");
		//errorCount++;
		//errors.push(new B_error("B_idState", "T_userId", idParse, idParse.size));
	}
	else
		validId = true;
	var equalMatch = matchToken("T_equal", index);
	index++;
	if(equalMatch.type == "T_errorP") //Equal sign is not present
	{
		errors.add(equalMatch.found.type, "User Id", 10, equalMatch.found.line, equalMatch.found.column);
		//putMessage("Error: Expected an equal sign after the user id. Found "+equalMatch.found.type+"at "+equalMatch.found.line+":"+equalMatch.found.column);
		//errorCount++;
		//errors.push(new B_error("B_printState", "T_closeParen", equalMatch, 1));
		
		var nextEqual = findNext("T_equal","",index);
		if(nextEqual != -1)
		{
			putMessage("   Found an equal sign at "+tokens[nextEqual].line+ ":"+tokens[nextEqual].column+". Will resume parsing from there");
			index = nextEqual+1;
		}
		else //There are no more equal signs
		{
			putMessage("   Did not find an equal sign for the variable assignment. Will assume equal sign was forgotten");
		}
	}
	
	var exprParse = parseExpr(index);
	index+= exprParse.size;
	if(exprParse.type == "B_error")//This is not a valid expr
	{
		errors.add(exprParse.found.type, "Expression", 10, exprParse.found.line, exprParse.found.column);
		//putMessage("Error: Expected an expression on the other side of the equal sign. Found "+exprParse.found.type+"at "+exprParse.found.line+":"+exprParse.found.column+". Will attempt to continue parsing");
		//errorCount++;
		//errors.push(new B_error("B_idState", "B_expr", exprParse, exprParse.size));
	}

	
	result = (new B_idState(index-startIndex,
							idParse,
							exprParse));
	tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not an id assignment statement");
		else
			putMessage("Id assignment parsed");
	}
	    
	levelIn--;
	tree = tree.parentRef();
	return result;
    }
    

function parseVarDecl(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse variable declaration");
    
	var result;
	tree = tree.addChild("B_varDecl", "");
	var startIndex = index;
	var validId = false;
	    
	    
	var typeMatch = matchToken("T_type", index);
	index++;
	if(typeMatch.type == "T_errorP")
	{
		errors.add(typeMatch.found.type, "Variable Type", 10, typeMatch.found.line, typeMatch.found.column);
		//putMessage("Error: Expected a var type. Found "+typeMatch.found.type+"at "+typeMatch.found.line+":"+typeMatch.found.column+". Will attempt to continue parsing");
		//errorCount++;
		//errors.push(new B_error("B_varDecl", "T_type", typeMatch, typeMatch.size));
	}
    else
        tree.addChild(typeMatch.type, typeMatch);
		
	var idParse = parseId( index);
	index+= idParse.size;
	if(idParse.type == "B_error") // This was not a valid id
	{
		errors.add(idParse.found.type, "User Id", 10, idParse.found.line, idParse.found.column);
		//putMessage("Error: Expected a user id. Found "+idParse.found.type+"at "+idParse.found.line+":"+idParse.found.column+". Will attempt to continue parsing");
		//errorCount++;
		//errors.push(new B_error("B_varDecl", "T_userId", idParse, idParse.size));
	}
			
	result = (new B_varDecl(index-startIndex,
						typeMatch,
						idParse));
	tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a variable declaration");
		else
			putMessage("Variable declaration  parsed");
	}
	
	levelIn--
	tree = tree.parentRef();
	return result;
    }
    
    
function parseStatementListState(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse statement list statement");
	    
	var result;
	tree = tree.addChild("NEWSCOPE", new B_scope("NEWSCOPE"));
	var startIndex = index;
	index++; //skip the open squiggly bracket that has already been read
	var nextClose = findNext("T_closeSBracket","T_openSBracket",index);
	    
	var statementListParse;
	if(nextClose != -1)
	{
		statementListParse = parseStatementList(index, nextClose);
		index+= statementListParse.size;
        index++; //For the close SBracket
	}
	else //There are no more close Sbrackets
	{
        errors.add(tokens[tokens.length-2].type, "T_closeSBracket", 11, tokens[tokens.length-2].line, tokens[tokens.length-2].column);
		//putMessage("Error: Did not find a close Sbracket for statement list. Will assume it was forgotten");
		statementListParse = parseStatementList(index, tokens.length-2); //Treat the rest of the program as a statementlist except for the EOF token
		index+= statementListParse.size;
		//errorCount++;
		//errors.push(new B_error("B_statementListState", "T_closeSBracket", tokens[index], 1));
	}
		
	statementListParse.size = (index-startIndex);
	result = statementListParse;
    //tree.token = result;
			
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a statement list statement");
		else
			putMessage("Statement list statement parsed");
	}
	    
	levelIn--;
    tree.addChild("ENDSCOPE", new B_scope("ENDSCOPE"));
    tree = tree.parentRef();
	return result;
    }

function parseStatementList(index, end)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse statement list");
	    
	var result;
	
	var startIndex = index;
	
	if(!(index >= end)) //The list hasn't been fully parsed
	{
		if(verb)
			putMessage("List is not empty");
		
        tree = tree.addChild("B_statementList","");
		var statementParse = parseStatement(index);
		index+= statementParse.size;
		//if(statementParse.type == "B_error")// This code is not a statement. Try to parse the rest of the list
		//{
		//	putMessage("Error: Expected a statement as part of a statement list. Found "+statementParse.found.type+" at "+statementParse.found.line+":"+statementParse.found.column);
		//	errorCount++;
		//	errors.push(new B_error("B_statementList", "B_statement", statementParse, statementParse.size));
		//}
		
		var statementListParse = parseStatementList(index, end);
		index+= statementListParse.size;
		if(statementListParse.type == "B_error") //This is not a valid statement list. Leave this reccursive madness!
		{
			result = new B_error("B_statementList", "B_statementList", statementListParse, statementListParse.size);
		}
		else //The recursion gives us something valid
			result = (new B_statementList(index-startIndex,
									statementParse,
									statementListParse));
        tree.token = result;
        tree = tree.parentRef();
	}
    else{ //We've reached the end of the list
        //tree = tree.addChild("Epsilon","");
        result = (new B_statementList(0,"",""));
    }
	
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a statement list");
		else
			putMessage("Statement list parsed");
	}
	    
	levelIn--
	return result;
    }


function parseWhileState(index)
    {
    levelIn++;
	if(verb)
		putMessage("Attempting to parse while statement");
	
	var result;
	tree = tree.addChild("B_whileState", "");
	var startIndex = index;
	index++; //skip the while that has already been read
        
	
	var boolExprParse = parseBoolExpr(index);
    index+= boolExprParse.size;
	
    
    var stateListParse = parseStatementListState(index);
    index+= stateListParse.size;
    
	
	result = new B_whileState(index-startIndex, boolExprParse, stateListParse);
	tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a while statement");
		else
			putMessage("While statement parsed");
	}
	
	levelIn--;
	tree = tree.parentRef();
	return result;
}


function parseIfState(index)
    {
    levelIn++;
    if(verb)
		putMessage("Attempting to parse if statement");
	
	var result;
	tree = tree.addChild("B_ifState", "");
	var startIndex = index;
	index++; //skip the if that has already been read    
	
	var boolExprParse = parseBoolExpr(index);
    index+= boolExprParse.size;
	
    
    var stateListParse = parseStatementListState(index);
    index+= stateListParse.size;
    
	
	result = new B_ifState(index-startIndex, boolExprParse, stateListParse);
	tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a if statement");
		else
			putMessage("If statement parsed");
	}
	
	levelIn--;
	tree = tree.parentRef();
	return result;
}


function parseExpr(index)
{
	levelIn++;
	if(verb)
		putMessage("Attempting to parse expression");
	var result;
	
	//Try to parse
	currToken = tokens[index];
	switch(currToken.type){
		case "T_digit":
			result = parseIntExpr(index);
			break;
		case "T_qoute":
			result = parseStringExpr(index);
			break;
		case "T_userId":
			result = parseId(index);
			break;
        case "T_openParen":
    		result = parseBoolExpr(index);
			break;
        case "T_bool":
    		result = parseBoolExpr(index);
			break;
		default: //None of those matched
            errors.add(currToken.type, "the start to an expression", 10, currToken.line, currToken.column);
			//putMessage("Error: Expected the start to an expr at " +currToken.line+ ":" +currToken.column+". Found " +currToken.type +".")
			//errorCount++;
            var currError = new B_error("B_expr", "Start to an expr ", matchToken("start to an expr", index), 1)
			//errors.push(currError);
			result = currError;
			break;
	}

	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not an expression");
		else
			putMessage("Expression parsed");
	}
	
	levelIn--;
	return result;
}
    
    
function parseIntExpr(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse int expression");
	
	var result;
	tree = tree.addChild("B_intExpr", "");
	var startIndex = index;
	
	var digitMatch = matchToken("T_digit",index);
	index++;
    tree.addChild(digitMatch.type, digitMatch); //We already type checked in parseExpr
    
	var opMatch = matchToken("_op", index);
	index++;
	    
	//if(digitMatch.type == "T_errorP") //Found something other than a digit. Skip if the next isnt an operator
	//{
    //    errors.add(digitMatch.type, "a digit", 10, digitMatch.line, digitMatch.column);
		//putMessage("Error: Expected a digit as part of an int expression. Found "+digitMatch.found.type+" at "+digitMatche.found.line+":"+digitMatch.found.column+". Will skip");
		//errorCount++;
		//errors.push(new B_error("B_intExpr", "T_digit", digitMatch, digitMatch.size));
        
    //    if(opMatch.type == "T_errorP") // The next isn't an operator, skip
	//	    result = parseIntExpr(index+1);    
	//}
	if(opMatch.type != "T_errorP")//found a digit with an operator
	{
        tree.addChild(opMatch.type, opMatch);
		var exprParse = parseExpr(index);
		index+= exprParse.size;
		result = (new B_intExprWOp(index-startIndex,
									digitMatch,
									opMatch,
									exprParse));
	}
	else //Found a digit with no operator following it
	{
		result = (new B_intExpr(1,digitMatch));
	}
	
    tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not an int expression");
		else
			putMessage("Int expression parsed");
	}
	
	levelIn--;
	tree = tree.parentRef();
	return result;
    }
    
    
function parseStringExpr(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse string expression");

	var result;
    tree = tree.addChild("B_stringExpr", "");
	var startIndex = index;
	index++; //skip the open qoute that has already been read
	    
	var nextQoute = findNext("T_qoute","", index);
	var charExprParse;
	if(nextQoute != -1)
	{
		charExprParse = parseCharList(index, nextQoute);
		index+= charExprParse.size;
        index++; //For the close qoute
	}
	else //There are no more qoutes
	{
        errors.add(tokens[tokens.length-2].type, "T_closeSBracket", 12, tokens[tokens.length-2].line, tokens[tokens.length-2].column);
		//putMessage("Error: Did not find a close qoute for char list. Will assume it was forgotten");
		charExprParse = parseCharList(index, tokens.length-2); //Treat the rest of the program as a char list except for the EOF token
		index+= charExprParse.size;
		//errorCount++;
		//errors.push(new B_error("B_charExpr", "T_qoute", tokens[index], 1));
	}
		
	charExprParse.size = (index-startIndex);
	result = charExprParse;
    tree.token = result;
			
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a statement list statement");
		else
			putMessage("String Expression parsed");
	}
	    
	levelIn--
	tree = tree.parentRef();
	return result;
    }
    
    
function parseCharList(index, end)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse char list");
    
	var result;
	var startIndex = index;
    tree = tree.addChild("B_charList", "");
    
	if(index != end) //The list hasn't been fully parsed
	{
		
		if(verb)
			putMessage("List is not empty");
		
		var charMatch = matchToken("T_char", index);
        var spaceMatch = matchToken("T_space", index);
		index++;
		if(charMatch.type == "T_errorP" && spaceMatch.type == "T_errorP")// This is not a valid char. Try to parse the rest of the list
		{
            errors.add(charMatch.type, "a char or space", 10, charMatch.line, charMatch.column);
			//putMessage("Error: Expected a char as part of a char list. Found "+charMatch.found.type+" at "+charMatch.found.line+":"+charMatch.found.column);
			//errorCount++;
			//errors.push(new B_error("B_charList", "T_char", charMatch, charMatch.size));
		}
		else{//This is valid syntax, add it to the tree
    	    if(spaceMatch.type == "T_errorP")
                tree.addChild(charMatch.type, charMatch);
            else
                tree.addChild(spaceMatch.type, spaceMatch);
		}
            
        
		var charListParse = parseCharList(index, end);
		index+= charListParse.size;
		if(charListParse.type == "B_error") //This is not a valid statement list. Leave this reccursive madness!
		{
			result = new B_error("B_charList", "B_charList", charListParse, charListParse.size);
		}
		else //The recursion gives us something valid
            result = (new B_charList(index-startIndex,
									charMatch,
									charListParse));
		
        
	}
    else{ //We've reached the end of the list
	    result = (new B_charList(0,"",""));
		//tree = tree.addChild("Epsilon","");
    }
     
    tree.token = result;
     
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a char list");
		else
			putMessage("Char list parsed");
	}
	
    tree = tree.parentRef();
	levelIn--;
	return result;
}

    
function parseId(index)
    {
	levelIn++;
	if(verb)
	    putMessage("Attempting to parse an id");
	    
	var result;
	tree = tree.addChild("B_id","");
	var charMatch = matchToken("T_userId", index);
	if(charMatch.type != "T_errorP"){ // This is a valid type
        tree.addChild(charMatch.type, charMatch);
		result = new B_id(1, charMatch);
	}
	else //Not a match
		result =new B_error("B_id", "T_userId", charMatch, 1);
    
    tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not an id");
		else
			putMessage("Id parsed");
	}
	    
	levelIn--;
	tree = tree.parentRef();
	return result;
}


function parseBoolExpr(index)
    {
    levelIn++;
	if(verb)
		putMessage("Attempting to parse bool expression");
	
	var result;
	tree = tree.addChild("B_boolExpr", "");
	var startIndex = index;
	
	var boolMatch = matchToken("T_bool",index);
    if(boolMatch.type != "T_errorP")//found an explicit bool val
	{
        index++;
        tree.addChild(boolMatch.type, boolMatch);
        result = new B_boolExpr(1,boolMatch);
	}
    else //This must be a comparison
    {
        var openParenMatch = matchToken("T_openParen",index);
        
    	if(openParenMatch.type =="T_errorP")//The next token is not an open paren. Assume it's missing
        {
	    	errors.add(openParenMatch.found.type, "T_openParen", 10, openParenMatch.found.line, openParenMatch.found.column);
    	}
	    else
		    index++; //skip the open paren
        
	
    	var firstExprParse = parseExpr(index);
    	index+= firstExprParse.size;
        
        var eqCompMatch = matchToken("T_eqComp",index);
        if(eqCompMatch.type =="T_errorP")//The next token is not a double equals sign. Assume it's missing
        {
        	errors.add(eqCompMatch.found.type, "T_equal", 10, eqCompMatch.found.line, eqCompMatch.found.column);
    	}
	    else{
            tree.addChild(eqCompMatch.type, eqCompMatch);
		    index++;
	    }
        
    	
        var secondExprParse = parseExpr(index);
        index+= secondExprParse.size;
        
    	var closeParenMatch = matchToken("T_closeParen", index);
    	index++;
    	if(closeParenMatch.type =="T_errorP")//The next token is not a close paren. Look for the next close paren and throw out anything in between
    	{
    		putMessage("Error: Expected a close parenthesis after the statement. Found "+closeParenMatch.found.type+" at "+closeParenMatch.found.line+":"+closeParenMatch.found.column);
    		errors.add(closeParenMatch.found.type, "T_closeParen", 10, closeParenMatch.found.line, closeParenMatch.found.column);
    		
    		var nextClose = findNext("T_closeParen","T_openParen",index);
    		if(nextClose != -1)
    		{
    			putMessage("   Found a close parenthesis at "+tokens[nextClose].line+ ":"+tokens[nextClose].column+". Will resume parsing from there");
    			index = nextClose+1;
    		}
    		else //There are no more close parens
    		{
    			putMessage("   Did not find a close paren for bool expression . Will resume parsing from"+" at "+closeParenMatch.found.line+":"+closeParenMatch.found.column);
    		}
    	}
    	
        result = new B_compBoolExpr(index-startIndex,firstExprParse,eqCompMatch, secondExprParse);
	}
	
	
    tree.token = result;
    
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a bool expression");
		else
			putMessage("Bool expression parsed");
	}
	
	levelIn--;
	tree = tree.parentRef();
	return result;
}

   
//Utilities
function matchToken(type, index)
    {
	levelIn++;
	    
	var token = tokens[index];
	var result;
	    
	if(verb)
		putMessage("Match Token matching token type: " + token.type + " to " + type);
	if(token.type == type)
	    result = token;
	else
	{
		//Regular Expressions of acceptable general search types
		var operationRege = /T_plus|sub/;
		switch(type)
		{
		case "_op":   
			if(operationRege.test(token.type))
			{
				result = token;
			}
			else
				result = new T_errorP(type, token);
				break;
		default:        
			result = new T_errorP(type, token);
			break;	
			}
	}
	
	levelIn--;
	return result;
    }
    
function findNext(searchType, nestingType, index)
    {
	var location = -1;
    var nestlevel = 0;
	var i = index;
	while(i<tokens.length && location ==-1)
	{
		if(tokens[i].type == nestingType)
    	{
			nestlevel++;
		}
        if(tokens[i].type == searchType)
		{
            if(nestlevel > 0) //This is not the matching pair
                nestlevel--;
            else
			    location = i;
		}
		i++;
	}
    
    return location;
}