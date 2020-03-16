var ChatSQL = {  
    insert:'INSERT INTO waitMessage(type,sender,receiver,content) VALUES(?,?,?,?)', 
    query:'SELECT * FROM waitMessage WHERE receiver = ?',  
    delete:'DELETE FROM waitMessage WHERE receiver = ?'
  };
module.exports = ChatSQL;