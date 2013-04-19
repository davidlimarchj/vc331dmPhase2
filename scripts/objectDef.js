//Token Definitions
function T_print(line, column)
   {
	this.type ="T_print";
	this.line = line;
	this.column = column;
   }
   
   function T_equal(line, column)
   {
	this.type ="T_equal";
	this.line = line;
	this.column = column;
   }
   
   function T_qoute(line, column)
   {
	this.type ="T_qoute";
	this.line = line.toString();
	this.column = column.toString();
   }
   
   function T_plus(line, column)
   {
	   this.type ="T_plus";
	this.line = line;
	this.column = column;
    this.inside ="+";
   }

   function T_sub(line, column)
   {
       this.type ="T_sub";
	this.line = line;
	this.column = column;
    this.inside ="-";
   }
   
   function T_openParen(line, column)
   {
	   this.type ="T_openParen";
	this.line = line;
	this.column = column;
   }
   
   function T_closeParen(line, column)
   {
	   this.type ="T_closeParen";
	this.line = line;
	this.column = column;
   }
   
   function T_openSBracket(line, column)
   {
	   this.type ="T_openSBracket";
	this.line = line;
	this.column = column;
   }
   
   function T_closeSBracket(line, column)
   {
	   this.type ="T_closeSBracket";
	this.line = line;
	this.column = column;
   }
   
   
    function T_userId(str, line, column)
   {
	   this.type ="T_userId";
	   this.inside = str;
	this.line = line;
	this.column = column;
    this.scope = "";
   }
   
   function T_type(str, line, column)
   {
	   this.type ="T_type";
	   this.inside = str
	this.line = line;
	this.column = column;
   }
      
   
    function T_digit(ident, line, column)
   {
	this.type ="T_digit";
	   this.inside = ident;
	this.line = line;
	this.column = column;
   }
   
    function T_char(ident, line, column)
   {
	this.type ="T_char";
	this.inside = ident;
	this.line = line;
	this.column = column;
   }
   
function T_space(line, column)
   {
	this.type ="T_char";
	this.inside = " ";
	this.line = line;
	this.column = column;
   }
   
 function T_string(line, column)
   {
    this.type ="T_string";
	this.line = line;
	this.column = column;
    this.inside = "";
   }
   
function T_BOF()
   {
	   this.type ="T_BOF";
   }
   
       function T_EOF(line, column)
   {
	this.type ="T_EOF";
	this.line = line;
	this.column = column;
	foundEOF = true;
   }
   
    function T_error(ident,line, column)
   {
	this.type ="T_error";
	this.inside = ident;
	this.line = line;
	this.column = column;
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
   
function B_stringExpr(size, inner)
   {
       this.size = size;
	   this.inner = inner;
	this.type ="B_intExpr";
    this.chars = new Array();
    this.addChar = function(inChar){
        putMessage("here");
        this.chars.push(inChar)
    }
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
   
function B_scope(type){
    this.type = type;
}
   
function B_error(step, expected, found, size)
   {
	this.step = step;
	this.expected = expected;
	this.found = found;
	this.size = size;
    this.line = found.line;
    this.column = found.column;
	this.type ="B_error";
    this.base = found.base;
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
function SyntaxTree(parent, type, token){
    this.parent = parent;
	this.type = type;
	this.token = token;
	this.children = new Array();
    this.spaceNeeded = 1;

	
	this.addChild = function(type, token)
	{
		var child =new SyntaxTree(this, type, token);
		this.children.push(child);
		return child;
	}
	
	this.parentRef= function()
	{   
		return this.parent;
	}
    
    this.refresh = function()
    {
        this.spaceNeeded = 1;
        for(var i =0;i<this.children.length;i++){
            this.children[i].refresh();
            this.spaceNeeded = this.spaceNeeded+this.children[i].spaceNeeded;
        }
    }
    
    this.print =function(tree){
        var parseReturnText = simplePrintTree(this,0);
        putMessage(parseReturnText);
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
            var previous = this.items[key];
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

function variable(type, value, line, column){
	this.type = type;
	this.value = value;
    this.line = line;
    this.column = column;
    this.used = false;
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
	
	this.setVar = function(id, newVar){
		return this.symTable.setItem(id, newVar);
	}
    
    this.localHas = function(id){
        return this.symTable.getItem(id);
    }
	
	this.newScope = function(){
		var newScope = new ScopeTree(this);
		this.children.push(newScope);
		return newScope;
	}
	
	this.closeScope = function(){
		return this.parent;
	}
    
    this.print = function(){
        var returnText ="";
	    returnText +="Symbol Table:\n";
	    returnText +="Identifier |Type           |Decl Location  |Value\n";
        returnText += printSymbolTable(this, 0)
        putMessage(returnText);
    }
}


//An object that builds up an array of errors and prints them out

var errorReference = new Array();
//Lex Errors
errorReference[0] = "Unkown symbol in lexer";
errorReference[1] = "Non-char or space symbol between qoutes";
errorReference[2] = "Unidentified indentifier found. User identifiers can only be one char long.";

//Parse Errors
errorReference[10] = "Expected ";
errorReference[11] = "Did not find a close Sbracket for statement list. Will assume it was forgotten.";
errorReference[12] = "Did not find a close qoute for char list. Will assume it was forgotten.";

//Sym Table Errors
errorReference[20] = "Invalid type in variable declaration. Declaration was ";
errorReference[21] = "Redeclared variable. Previous declaration was ";
errorReference[22] = "Type mismatch in operation. Operation was ";
errorReference[23] = "Type mismatch in id assignment. Id assignment was ";
errorReference[24] = "Undeclared id. Id was:";




//Warnings
errorReference[50] = "Expected a dollar sign at the end of the program. Added for you.";
errorReference[51] = "Found code after the dollar sign. Ignored.";
errorReference[52] = "Token list was not properly lexed. Parser will attempt to continue.";
errorReference[53] = "Id declared but not used. Id: ";
errorReference[54] = "Id used before its initialization. Id: ";


function ErrorHandler()
{    
	var count = 0;
	var errorArr = new Array();
	
	//internal object that holds the error refrence number, and the line and column where the error occured
	function error(found, expected, num, line, col){
		this.found = found;
		this.expected = expected;
		this.num = num;
		this.line = line;
		this.column = col;
	}
	
	this.add = function(found, expected, num, line, col)
	{
		errorArr.push(new error(found, expected, num, line, col));
		count++;
	}
    
    this.errorCount = function(){
        return count;
    }
	
	this.print = function(){
		putMessage("Error List:");
		for(var i=0;i<count;i++){
			var currError =errorArr[i];
			if(currError.num == 10)
				putMessage("Error "+currError.num+" at "+currError.line+","+currError.column+" : "+errorReference[currError.num]+currError.expected+" found "+currError.found);
			else if(currError.num > 10 && currError.num<20)
                putMessage("Error "+currError.num+" at "+currError.line+","+currError.column+" : "+errorReference[currError.num]);
            else if(currError.num > 20 && currError.num<30)
                putMessage("Error "+currError.num+" at "+currError.line+","+currError.column+" : "+errorReference[currError.num]+currError.found+currError.expected);
            else if(currError.num >= 50)
                putMessage("Warning "+currError.num+" at "+currError.line+","+currError.column+" : "+errorReference[currError.num]+ currError.found);
            else
				putMessage("Error "+currError.num+" at "+currError.line+","+currError.column+" : "+errorReference[currError.num]);
			
			/*
		if(/userId|type|digit|char/.test(currError.base.type))//This is one of the tokens with extra information
		    putMessage("At "+currError.line+":"+currError.column + " Expected: "+ currError.expected +". Found: " +currError.base.inside);
		else
			    putMessage("At "+currError.line+":"+currError.column + " Expected: "+ currError.expected +". Found: " +currError.base.type);*/
		}
        putMessage("");
	}
}

