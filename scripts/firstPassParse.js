// Global variables
    var tree;
    var verb;
    //var currScope;
    var errorCount;
    var errors;
    
    
    function firstPassParse(verbose)
    {
    levelIn++;
	
	//Initialize gloal vars
	errorCount = 0;
	errors = new Array();
	    
	verb = verbose;
	tree = "";
	//currScope = new ScopeTree(null);
	    
        putMessage("Started First Pass Parsing");
        tree = parseProgram();
	
        //Report the results.
        putMessage("Parsing Completed with "+errorCount+" errors.");
	    
//	if(tree.type != "B_error") //No errors
	  //  {
	//	putMessage("Program was syntactically valid");
		levelIn--;
		printParseTree();
		printSymbolTable();
	//    }
//	else //Encountered an error
	 //   {
	//	putMessage("Program was not syntactically valid");
	//	levelIn--;
		errorHandler();
	  //  }
	
	return tree;
    }

     function parseProgram()
    {
	levelIn++;
	    
	if(verb)
	    putMessage("Attempting to parse program");
	var index = 0;
	var result;
	if(tokens[index].type != "T_BOF") //This is not a validly lexed program
	{
		putMessage("Warning: Token list was not properly lexed");
		putMessage("	Parser will attempt to parse.");
		errorCount++;
	}
	else //The beginning is lexographically sound, skip the BOF
		index++; 
	
	var statementParse = parseStatement(index);
	if(statementParse.type != "B_error") //Parsing the Statement did not result in errors
	{
		result = (new B_program(statementParse.size,statementParse));
		index+= statementParse.size;
	}
	else //Statement did not match
		result = new B_error("B_program","Start to a program", statementParse.found, statementParse.size);

	var EOFMatch = matchToken("T_EOF", index);
	if(EOFMatch.type == "T_errorP") //There is code after we should be done parsing
	{
		putMessage("Error: Found extra code at "+EOFMatch.line+":"+EOFMatch.column+". Discarded");
        errorCount++;
    	errors.push(new B_error("B_Program", "Nothing", EOFMatch, 1));
	}
	
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a valid program");
		else
			putMessage("Program parsed with "+result.size+" tokens");
	}
	
	levelIn--;
	return result;
}

    function parseStatement(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse statement");
	    
	var result;
	    
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
		default: //None of those matched
			putMessage("Error: Expected the start to a statement at " +currToken.line+ ":" +currToken.column+". Found " +currToken.type +".");
			errorCount++;
            var currError = new B_error("B_statement", "Start to a statement", matchToken("start to a statement", index), 1);
			errors.push(currError);
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
	return result;
    }

  
function parsePrintState(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse print statement");
	
	var result;
	var startIndex = index;
	index++; //skip the P that has already been read
	
	
	var openParenMatch = matchToken("T_openParen", index);
	if(openParenMatch.type =="T_errorP")//The next token is not an open paren. Assume it's missing
	{
		putMessage("Error: Expected an open parenthesis after the print operator. Found "+openParenMatch.found.type+" at " +openParenMatch.found.line+":"+openParenMatch.found.column+"Will attempt to continue parsing");
		errorCount++;
		errors.push(new B_error("B_printState", "T_openParen", openParenMatch, 1));
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
		errorCount++;
		errors.push(new B_error("B_printState", "T_closeParen", closeParenMatch, 1));
		
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
	
	if(verb)
	{
		//if(result.type == "B_error")
		//	putMessage("Not a print statement");
		//else
			putMessage("Print statement parsed");
	}
	
	levelIn--;
	return result;
}


function parseIdState(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse id assignment statement");
	    
	var result;
	var startIndex = index;
	var validId = false;
	    
	var idParse= parseId(index);
	index+= idParse.size;
	if(idParse.type == "B_error") // This was not a valid id
	{
		putMessage("Error: Expected a user id. Found "+idParse.found.type+"at "+idParse.found.line+":"+idParse.found.column+". Will attempt to continue parsing");
		errorCount++;
		errors.push(new B_error("B_idState", "T_userId", idParse, idParse.size));
	}
	else
		validId = true;
	var equalMatch = matchToken("T_equal", index);
	index++;
	if(equalMatch.type == "T_errorP") //Equal sign is not present
	{
		putMessage("Error: Expected an equal sign after the user id. Found "+equalMatch.found.type+"at "+equalMatch.found.line+":"+equalMatch.found.column);
		errorCount++;
		errors.push(new B_error("B_printState", "T_closeParen", equalMatch, 1));
		
		/*var nextEqual = findNext("T_equal","",index);
		if(nextEqual != -1)
		{
			putMessage("   Found an equal sign at "+tokens[nextEqual].line+ ":"+tokens[nextEqual].column+". Will resume parsing from there");
			index = nextEqual+1;
		}
		else //There are no more equal signs
		{
			putMessage("   Did not find an equal sign for the variable assignment. Will assume equal sign was forgotten");
		}*/
	}
	
	var exprParse = parseExpr(index);
	index+= exprParse.size;
	if(exprParse.type == "B_error")//This is not a valid expr
	{
		putMessage("Error: Expected an expression on the other side of the equal sign. Found "+exprParse.found.type+"at "+exprParse.found.line+":"+exprParse.found.column+". Will attempt to continue parsing");
		errorCount++;
		errors.push(new B_error("B_idState", "B_expr", exprParse, exprParse.size));
	}
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
	
	result = (new B_idState(index-startIndex,
							idParse,
							exprParse));
	
	if(verb)
	{
		//if(result.type == "B_error")
		//	putMessage("Not an id assignment statement");
		//else
			putMessage("Id assignment parsed");
	}
	    
	levelIn--;
	return result;
    }
    

function parseVarDecl(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse variable declaration");
    
	var result;
	var startIndex = index;
	var validId = false;
	    
	    
	var typeMatch = matchToken("T_type", index);
	index++;
	if(typeMatch.type == "T_errorP")
	{
		putMessage("Error: Expected a var type. Found "+typeMatch.found.type+"at "+typeMatch.found.line+":"+typeMatch.found.column+". Will attempt to continue parsing");
		errorCount++;
		errors.push(new B_error("B_varDecl", "T_type", typeMatch, typeMatch.size));
	}
	else
		validId = true;
		
	var idParse = parseId( index);
	index+= idParse.size;
	if(idParse.type == "B_error") // This was not a valid id
	{
		putMessage("Error: Expected a user id. Found "+idParse.found.type+"at "+idParse.found.line+":"+idParse.found.column+". Will attempt to continue parsing");
		errorCount++;
		errors.push(new B_error("B_varDecl", "T_userId", idParse, idParse.size));
	}
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
			
	result = (new B_varDecl(index-startIndex,
						typeMatch,
						idParse));
	
	if(verb)
	{
		//if(result.type == "B_error")
		//	putMessage("Not a variable declaration");
		//else
			putMessage("Variable declaration  parsed");
	}
	
	levelIn--
	return result;
    }
    
    
function parseStatementListState(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse statement list statement");
	    
	var result;
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
		putMessage("Error: Did not find a close Sbracket for statement list. Will assume it was forgotten");
		statementListParse = parseStatementList(index, tokens.length-2); //Treat the rest of the program as a statementlist except for the EOF token
		index+= statementListParse.size;
		errorCount++;
		errors.push(new B_error("B_statementListState", "T_closeSBracket", tokens[index], 1));
	}
		
	statementListParse.size = (index-startIndex);
	result = statementListParse;
			
	if(verb)
	{
		//if(result.type == "B_error")
		//	putMessage("Not a statement list statement");
		//else
			putMessage("Statement list statement parsed");
	}
	    
	levelIn--
	return result;
    }

function parseStatementList(index, end)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse statement list");
	    
	var result;
	var startIndex = index;
	
	if(index != end) //The list hasn't been fully parsed
	{
		if(verb)
			putMessage("List is not empty");
		
		var statementParse = parseStatement(index);
		index+= statementParse.size;
		/*if(statementParse.type == "B_error")// This code is not a statement. Try to parse the rest of the list
		{
			putMessage("Error: Expected a statement as part of a statement list. Found "+statementParse.found.type+" at "+statementParse.found.line+":"+statementParse.found.column);
			errorCount++;
			errors.push(new B_error("B_statementList", "B_statement", statementParse, statementParse.size));
		}*/
		
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
	}
    else //We've reached the end of the list
        result = (new B_statementList(0,"",""));
	
	if(verb)
	{
		//if(result.type == "B_error")
		//	putMessage("Not a statement list");
		//else
			putMessage("Statement list parsed");
	}
	    
	levelIn--
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
			result = parseCharExpr(index);
			break;
		case "T_userId":
			result = parseId(index);
			break;
		default: //None of those matched
			putMessage("Error: Expected the start to an expr at " +currToken.line+ ":" +currToken.column+". Found " +currToken.type +".")
			errorCount++;
            var currError = new B_error("B_expr", "Start to an expr ", matchToken("start to an expr", index), 1)
			errors.push(currError);
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
	var startIndex = index;
	
	var digitMatch = matchToken("T_digit",index);
	index++;
	var opMatch = matchToken("_op", index);
	index++;
	    
	if(digitMatch.type == "T_errorP") //Found something other than a digit. Skip
	{
		putMessage("Error: Expected a digit as part of an int expression. Found "+digitMatch.found.type+" at "+digitMatche.found.line+":"+digitMatch.found.column+". Will skip");
		errorCount++;
		errors.push(new B_error("B_intExpr", "T_digit", digitMatch, digitMatch.size));
		result = parseIntExpr(index+1);
	}
	else if(opMatch.type != "T_errorP")//found a digit with an operator
	{
		var exprParse = parseExpr(index);
		index+= exprParse.size;
		if(exprParse.type == "B_error")//This is not a valid expr
		{
			putMessage("Error: Expected an expression on the other side of the operator. Found "+exprParse.found.type+"at "+exprParse.found.line+":"+exprParse.found.column+". Will attempt to continue parsing");
			errorCount++;
			errors.push(new B_error("B_intExprWOp", "B_expr", exprParse, exprParse.size));
		}
		result = (new B_intExprWOp(index-startIndex,
									digitMatch,
									opMatch,
									exprParse));
	}
	else //Found a digit with no operator following it
	{
		result = (new B_intExpr(1,digitMatch));
	}
	
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not an int expression");
		else
			putMessage("Int expression parsed");
	}
	
	levelIn--;
	return result;
    }
    
    
    function parseCharExpr(index)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse char expression");
    
	var result;
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
		putMessage("Error: Did not find a close qoute for char list. Will assume it was forgotten");
		charExprParse = parseCharList(index, tokens.length-2); //Treat the rest of the program as a char list except for the EOF token
		index+= charExprParse.size;
		errorCount++;
		errors.push(new B_error("B_charExpr", "T_qoute", tokens[index], 1));
	}
		
	charExprParse.size = (index-startIndex);
	result = charExprParse;
			
	if(verb)
	{
		//if(result.type == "B_error")
		//	putMessage("Not a statement list statement");
		//else
			putMessage("Char Expression parsed");
	}
	    
	levelIn--
	return result;
    }
    
    
function parseCharList(index, end)
    {
	levelIn++;
	if(verb)
		putMessage("Attempting to parse char list");
    
	var result;
	var startIndex = index;

	if(index != end) //The list hasn't been fully parsed
	{
		if(verb)
			putMessage("List is not empty");
		
		var charMatch = matchToken("T_char", index);
		index++;
		if(charMatch.type == "T_errorP")// This is not a valid char. Try to parse the rest of the list
		{
			putMessage("Error: Expected a char as part of a char list. Found "+charMatch.found.type+" at "+charMatch.found.line+":"+charMatch.found.column);
			errorCount++;
			errors.push(new B_error("B_charList", "T_char", charMatch, charMatch.size));
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
    else //We've reached the end of the list
	    result = (new B_charList(0,"",""));
        
	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not a char list");
		else
			putMessage("Char list parsed");
	}
	
	levelIn--;
	return result;
    }

    
function parseId(index)
    {
	levelIn++;
	if(verb)
	    putMessage("Attempting to parse an id");
	    
	var result;
	var charMatch = matchToken("T_userId", index);
	if(charMatch.type != "T_errorP") // This is a valid type
		result = new B_id(1, charMatch);
	else //Not a match
		result =new B_error("B_id", "T_userId", charMatch, 1);

	if(verb)
	{
		if(result.type == "B_error")
			putMessage("Not an id");
		else
			putMessage("Id parsed");
	}
	    
	levelIn--;
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