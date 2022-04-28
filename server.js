// express
const express = require("express");
const app = express();

// css적용
app.use(express.static('views'));

// body-parser
app.use(express.urlencoded({extended:true}));

// EJS
app.set('view engine','ejs');

// delete나 method를 사용하기 위함
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// mongodb
const MongoClient = require('mongodb').MongoClient;

// 데이터베이스 접근
let dbUrl = 'mongodb+srv://admin:qwer1234@cluster0.3uwxb.mongodb.net/bookDB?retryWrites=true&w=majority';
let bookApp;

MongoClient.connect(dbUrl,
    (error,client)=>{ 
        if(error) return console.log('데이터베이스 오류');
        
        bookApp = client.db('bookDB');

        app.listen(8080,()=>{
            console.log('8080 포트 오픈');
        })
    }
)

// 글 등록
app.get('/write',(req,res)=>{
    res.render('write.ejs');
})

// 글 삭제
app.delete('/delete',(req,res)=>{
    req.body._id=parseInt(req.body._id);
    bookApp.collection('booklist').deleteOne({_id:req.body._id},(error,result)=>{
        if(error) return console.log('삭제 오류');
        res.status(200);
    }) 
});

// 글 수정
// 등록된 글을 찾는다
app.get('/update/:id',(req,res)=>{
    bookApp.collection('booklist').findOne({_id:Number(req.params.id)},(error,result)=>{
        res.render('update.ejs',{결과:result});
    })  
})

app.put('/put',(req,res)=>{
    let appNumber = Number(req.body.number);
    let appTitle = req.body.title;
    let appContent = req.body.content;
    let appGenre = req.body.genre;
    let appWriter = req.body.writer;

    bookApp.collection('booklist').updateOne(
        {_id:Number(req.body.id)},
        {$set:{number:appNumber, title:appTitle, content:appContent, genre:appGenre, writer:appWriter}},
        (error,result)=>{
            if(error) return console.log('수정 오류');
            res.redirect('/');
        })
})


// 넘어온 자료를 데이터베이스에 기록
app.post('/add',(req,res)=>{
    let appNumber = parseInt(req.body.number);
    let appTitle = req.body.title;
    let appContent = req.body.content;
    let appGenre = req.body.genre;
    let appWriter = req.body.writer;

    bookApp.collection('postcount').findOne({번호:'번호',제목:'제목',내용:'내용',장르:'장르',저자:'저자'},(error,result)=>{
        if(error) return console.log('검색 오류');
        let totalCount = result.전체갯수;

        bookApp.collection('booklist').insertOne({
            number:appNumber, title:appTitle, content:appContent, genre:appGenre, writer:appWriter, _id:totalCount+1
        },(error,result)=>{
            if(error) return console.log('등록 오류');
            console.log('등록 성공');

            bookApp.collection('postcount').updateOne({번호:'번호',제목:'제목',내용:'내용',장르:'장르',저자:'저자'},{$inc:{전체갯수:1}},
            (error,result)=>{
                if(error) return console.log('업데이트 오류');  
                res.redirect('/');
            })
        })
    })
})

// index.ejs에 넘어온 자료를 보여줌
app.get('/',(req,res)=>{
    bookApp.collection('booklist').find().toArray((error,result)=>{
        if(error) return console.log('자료검색 오류');
        res.render('index.ejs',{bookData:result});
    })
})