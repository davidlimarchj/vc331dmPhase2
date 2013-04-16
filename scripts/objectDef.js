//Token Definitions
function T_print(line, column)
   {
	this.type ="T_print";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Print Token Created");
   }
   
   function T_equal(line, column)
   {
	this.type ="T_equal";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Equal Token Created");
   }
   
   function T_qoute(line, column)
   {
	   this.type ="T_qoute";
	this.line = line.toString();
	this.column = column.toString();
	if(verb)
		putMessage("Qoute Token Created");
   }
   
   function T_plus(line, column)
   {
	   this.type ="T_plus";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Plus Token Created");
   }

   function T_sub(line, column)
   {
       this.type ="T_sub";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Subtraction Token Created");
   }
   
   function T_openParen(line, column)
   {
	   this.type ="T_openParen";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Open Parenthesis Token Created");
   }
   
   function T_closeParen(line, column)
   {
	   this.type ="T_closeParen";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Close Parenthesis Token Created");
   }
   
   function T_openSBracket(line, column)
   {
	   this.type ="T_openSBracket";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Open Squiggly Bracket Token Created");
   }
   
   function T_closeSBracket(line, column)
   {
	   this.type ="T_closeSBracket";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Close Squiggly Bracket Token Created");
   }
   
   
    function T_userId(str, line, column)
   {
	   this.type ="T_userId";
	   this.inside = str;
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("User Id Token Created with value " + str);
   }
   
   function T_type(str, line, column)
   {
	   this.type ="T_type";
	   this.inside = str
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Variable Type Token Created");
   }
      
   
    function T_digit(ident, line, column)
   {
	this.type ="T_digit";
	   this.inside = ident;
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Digit Token Created with value " + ident);
   }
   
    function T_char(ident, line, column)
   {
	this.type ="T_char";
	this.inside = ident;
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Char Token Created with value " + ident);
   }
   
function T_space(, line, column)
   {
	this.type ="T_char";
	this.inside = " ";
	this.line = line;
	this.column = column;
	   if(verb)
		putMessage("Space Token Created");
   }
   
       function T_BOF()
   {
	   this.type ="T_BOF";
	   if(verb)
		putMessage("Beginning of File Token Created");
   }
   
       function T_EOF(line, column)
   {
	this.type ="T_EOF";
	this.line = line;
	this.column = column;
	foundEOF = true;
	if(verb)
		putMessage("End of File Token Created");
   }
   
    function T_error(ident,line, column)
   {
	this.type ="T_error";
	this.inside = ident;
	this.line = line;
	this.column = column;
	   errorCount++;
	if(verb)
		putMessage("Error Token Created");
   }


//Block Definitions
function B_program(size, statement)
   {
	this.size = size;
	this.statement = statement;
	this.type ="B_program";
   }
   
function B_printState(size, expr)
   {
	   this.size = size;
	   this.expr = expr;
	this.type ="B_printState";
   }
   
function B_idState(size, id, expr)
   {
	   this.size = size;
	   this.id = id;
	   this.expr = expr;
	this.type ="B_idState";
   }
   
   
function B_varDecl(size, kind, id)
   {
	   this.size = size;
	   this.kind = kind;
	   this.id = id;
	this.type ="B_varDecl";
   }
   
function B_statementList(size, statement, statementList)
   {
	   this.size = size;
	   this.statement = statement;
	   this.statementList = statementList;
	this.type ="B_statementList";
   }
   
function B_intExpr(size, inner)
   {
	   this.size = size;
	   this.inner = inner;
	this.type ="B_intExpr";
   }
   
function B_intExprWOp(size, digitT, op, expr)
   {
	   this.size = size;
	   this.digitT = digitT;
	   this.op = op;
	   this.expr = expr;
	this.type ="B_intExprWOp";
   }
   
function B_charList(size, charT, charList)
   {
	   this.size = size;
	   this.charT = charT;
	   this.charList = charList;
	this.type ="B_charList";
   }
   
function B_id(size, idT)
   {
	   this.size = size;
	   this.idT = idT;
	this.type ="B_id";
   }
   
function B_error(step, expected, found, size)
   {
	this.step = step
	this.expected = expected;
	this.found = found;
	this.size = size;
    this.line = found.line;
    this.column = found.column
	this.type ="B_error";
    this.base = found.base
   }
    
    
//Parse Error Token
function T_errorP(expected, found)
   {
	this.type ="T_errorP";
	this.depth = 0;
	this.expected = expected;
	this.found = found;
    this.line = found.line;
    this.column = found.column;
    this.base = found;
   }
    
   
   
 //Syntax Tree definition
function SyntaxTree(parent, token){
	this.token = token;
	this.parent = parent;
	this.children = new Array();
	
	this.addChild = function(token)
	{
		var child =new SyntaxTree(this, token);
		children.push(child);
		return child;
	}
	
}

   
   
   //Manages the symbol table (hash table) object type
function HashTable(table)
{
    //Based on the model provided by Dan Allen at http://www.mojavelinux.com/articles/javascript_hashes.html
    this.size = 0;
    this.items = {};
    for (var ident in table) {
        if (table.hasOwnProperty(indent)) {
            this.items[indent] = table[ident];
            this.size++;
        }
    }

    this.setItem = function(key, value)
    {
        var previous = null;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.size++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function(key) {
        if(this.hasItem(key))
		return this.items[key];
	else
		return null;
    }

    this.hasItem = function(key)
    {
        return this.items.hasOwnProperty(key);
    }
   
    this.removeItem = function(key)
    {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.size--;
            delete this.items[key];
            return previous;
        }
        else {
            return null;
        }
    }

    this.keys = function()
    {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function()
    {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }

    this.clear = function()
    {
        this.items = {}
        this.size = 0;
    }
}

function variable(type, value){
	this.type = type;
	this.value = value;
	this.used = false;
	if(verb)
		putMessage("Variable created of type " + type + " and value " + value);
}


//The scope tree that manages scope level and the symbol tables
function ScopeTree(parent){
	this.symTable = new HashTable();
	this.parent = parent;
	this.children = new Array();
	
	this.member = function(varName){
		var item =this.symTable.getItem(varName);
		if(item != null) //The variable is defined in the local scope
			return item;
		else if(this.parent != null) //There is a parent to recursively check
			return this.parent.member(varName);
		else //There is no parent to check, and it is not in this scope
			return null;
	}
	
	this.addVar = function(token, type){
		var previous = this.symTable.getItem(token.inside);
		if (previous != null){ // Variable has already been defined in this scope
			errorCount++; 
			errors.push("Redefining variable at "+ token.line + ":" token.column + ". Previous declaration was of type "+ previous.type);
		}
		else{ //Variable has not been defined locally, define it
			this.symTable.setItem(token.inside, new variable(type, "!!undef!!"));
		}
	}
	
	this.setVar = function(token, value){
		var item =this.symTable.getItem(token.inside);
		if(item != null){ //The variable is defined in the local scope
			var type = item.type;
			var used = item.used;
			this.symTable.setItem(token.inside, new variable(type, value, used);
		}
		else if(this.parent != null) //There is a parent to recursively check
			return this.parent.setVar(token, value);
		else{ //This is undeclared
			errorCount++; 
			errors.push("Undeclared variable at "+ token.line + ":" token.column + ". Trying to assign value "+ value);
		}
	}
	
	this.newScope = function(){
		var newScope = new ScopeTree(this);
		children.push(newScope);
		return newScope;
	}
	
	this.closeScope = function(){
		return this.parent;
	}
}


//An object that builds up an array of errors and prints them out

function ErrorHandler()
{	
	var count = 0;
	var errorArr = new Array();
	var refrence = new Array("Unkown symbol in Lex",
						"Non-char or space symbol between qoutes",
						"Unidentified indentifier found. User identifiers can only be one char long."
						
						
						
						
						);
	
	//internal object that holds the error refrence number, and the line and column where the error occured
	function error(found, expected, number, line, column){
		this.found = found;
		this.expected = expected;
		this.number = number;
		this.line = line;
		this.column = column;
	}
	
	this.add = function(found, expected, number, line, column)
	{
		errorArr.push(new error(found, expected, number, line, column));
		count++;
	}
	
	this.print = function(){
		putMessage("Error List:");
		for(var i=0;i<count;i++){
			var currError =errorArr[i];
			putMessage("Error "+currError.number+" at "+currError.line+","+currError.column+" : "+refrence[currError.number]);
			
			/*
		if(/userId|type|digit|char/.test(currError.base.type))//This is one of the tokens with extra information
		    putMessage("At "+currError.line+":"+currError.column + " Expected: "+ currError.expected +". Found: " +currError.base.inside);
		else
			    putMessage("At "+currError.line+":"+currError.column + " Expected: "+ currError.expected +". Found: " +currError.base.type);*/
		}
	}
}	

