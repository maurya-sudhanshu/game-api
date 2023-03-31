var input = [{ id: 1, slugId: 14, slugname: "CONGRESS HOLI", slugimage: "add_slug-1662283679686-280515336.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 17, Subcatname: "Holi", Subcatimage: "add_sub_cat-1662283535813-230624577.png", status: "Y", createOn: "2022-09-22T09:28:58.000Z" }, { id: 2, slugId: 16, slugname: "Businessman style", slugimage: "add_slug-1663051353073-877731686.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 17, Subcatname: "Holi", Subcatimage: "add_sub_cat-1662283535813-230624577.png", status: "Y", createOn: "2022-09-22T09:28:58.000Z" }, { id: 3, slugId: 18, slugname: " 5 years experience developer", slugimage: "add_slug-1663051690656-634079210.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 17, Subcatname: "Holi", Subcatimage: "add_sub_cat-1662283535813-230624577.png", status: "Y", createOn: "2022-09-22T09:28:58.000Z" }, { id: 4, slugId: 17, slugname: "Freshers celebration", slugimage: "add_slug-1663051623567-10970673.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 17, Subcatname: "Holi", Subcatimage: "add_sub_cat-1662283535813-230624577.png", status: "Y", createOn: "2022-09-22T09:28:58.000Z" }, { id: 5, slugId: 15, slugname: "BJP HOLI", slugimage: "add_slug-1662283691843-48171334.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 17, Subcatname: "Holi", Subcatimage: "add_sub_cat-1662283535813-230624577.png", status: "Y", createOn: "2022-09-22T09:28:58.000Z" }, { id: 6, slugId: 16, slugname: "Businessman style", slugimage: "add_slug-1663051353073-877731686.png", catId: 44, Catname: "International Programmer's day", Catimage: "add_cat-1663050093974-896633895.png", subcatId: 19, Subcatname: "Programmers celibration", Subcatimage: "add_sub_cat-1663050763025-692632444.png", status: "Y", createOn: "2022-09-22T09:29:17.000Z" }, { id: 7, slugId: 17, slugname: "Freshers celebration", slugimage: "add_slug-1663051623567-10970673.png", catId: 44, Catname: "International Programmer's day", Catimage: "add_cat-1663050093974-896633895.png", subcatId: 19, Subcatname: "Programmers celibration", Subcatimage: "add_sub_cat-1663050763025-692632444.png", status: "Y", createOn: "2022-09-22T09:29:17.000Z" }, { id: 8, slugId: 16, slugname: "Businessman style", slugimage: "add_slug-1663051353073-877731686.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 18, Subcatname: "Businessman ", Subcatimage: "add_sub_cat-1663050461884-351806552.png", status: "Y", createOn: "2022-09-22T09:29:37.000Z" }, { id: 11, slugId: 14, slugname: "CONGRESS HOLI", slugimage: "add_slug-1662283679686-280515336.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 19, Subcatname: "Programmers celibration", Subcatimage: "add_sub_cat-1663050763025-692632444.png", status: "Y", createOn: "2022-09-22T09:44:04.000Z" }, { id: 12, slugId: 15, slugname: "BJP HOLI", slugimage: "add_slug-1662283691843-48171334.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 19, Subcatname: "Programmers celibration", Subcatimage: "add_sub_cat-1663050763025-692632444.png", status: "Y", createOn: "2022-09-22T09:44:04.000Z" }, { id: 13, slugId: 16, slugname: "Businessman style", slugimage: "add_slug-1663051353073-877731686.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 19, Subcatname: "Programmers celibration", Subcatimage: "add_sub_cat-1663050763025-692632444.png", status: "Y", createOn: "2022-09-22T09:44:04.000Z" }, { id: 14, slugId: 14, slugname: "CONGRESS HOLI", slugimage: "add_slug-1662283679686-280515336.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 20, Subcatname: "Developer celebration ", Subcatimage: "add_sub_cat-1663051456339-307987347.png", status: "Y", createOn: "2022-09-22T09:44:34.000Z" }, { id: 15, slugId: 17, slugname: "Freshers celebration", slugimage: "add_slug-1663051623567-10970673.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 20, Subcatname: "Developer celebration ", Subcatimage: "add_sub_cat-1663051456339-307987347.png", status: "Y", createOn: "2022-09-22T09:44:34.000Z" }, { id: 16, slugId: 16, slugname: "Businessman style", slugimage: "add_slug-1663051353073-877731686.png", catId: 43, Catname: "Festivals", Catimage: "add_cat-1662283486801-298957699.png", subcatId: 20, Subcatname: "Developer celebration ", Subcatimage: "add_sub_cat-1663051456339-307987347.png", status: "Y", createOn: "2022-09-22T09:44:34.000Z" }];

var grouped = Object.values(input.reduce(function (agg, item) {

    agg[item.catId] ??= {
        id: item.id,
        catId: item.catId,
        Catname: item.Catname,
        status: item.status,
        createOn: item.createOn,
        "subcat-details": {}
    }

    agg[item.catId]["subcat-details"][item.subcatId] ??= {
        subcatId: item.subcatId,
        Subcatname: item.Subcatname,
        Subcatimage: item.Subcatimage,
        "slug-details": []
    }

    agg[item.catId]["subcat-details"][item.subcatId]["slug-details"].push({
        slugId: item.slugId,
        slugname: item.slugname,
        slugimage: item.slugimage,
    })

    return agg;
}, {}));

var result = grouped.map(function (item) {
    item["subcat-details"] = Object.values(item["subcat-details"])
    return item;
})


console.log(result)




// con.query('SELECT * FROM `bet-table` WHERE `id`=?',[381]).then(rows => {
//     console.log(rows);
// },err=>{
//     console.log(err);
// });
queryPromise1 = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM `bet-table` WHERE `id`=?',['381'], (error, results) => {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
};

con.query("UPDATE `wallet` SET `Winning_wallet`=`Winning_wallet`+(SELECT `if_open_zero` FROM `bet-table` WHERE `id`=? ORDER BY id DESC LIMIT 1) WHERE `user_name`=(SELECT `username` FROM `bet-table` WHERE `id`=?);", [a.id, a.id], (err, result) => {
    if (err) throw err;
    if (result) {
        con.query("INSERT INTO `statement`(`username`,`bet_or_type`,`period`,`Select`,`bet_from`, `bet_balance`, `total_balance`) VALUES ((SELECT `username` FROM `bet-table` WHERE `id`=?),'Win Amount',(SELECT `Period` FROM `bet-table` WHERE `id`=?),(SELECT gt.name FROM `bet-table` as bt INNER join game_type gt on bt.`game-type`=gt.id  WHERE bt.id=?),'Winning Wallet',(SELECT `if_open_zero` FROM `bet-table` WHERE `id`=?),(SELECT (`wallet_balance`+`Winning_wallet`+`Bonus_wallet`) as balance FROM `wallet` WHERE `user_name` = (SELECT `username` from `bet-table` WHERE id = ?)))",
            [a.id, a.id, a.id, a.id, a.id], (errror, rese) => {
                if (errror) throw errror;
                if (rese) {
                    console.log("dome");
                }
            })
        console.log("done");
    }
})