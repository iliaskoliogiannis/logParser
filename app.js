const axios = require('axios');
const fse = require('fs-extra');
const moment = require('moment');
const notifier = require('node-notifier');

const erpUrl = "http://localhost:4000/products/fetch";
const siteUrl = "http://localhost:4000/products";

fse.readFile("./products.log", "utf-8")
   .then(result => {

      let products = [];
      let array = result.split(/\r\n/).filter(e => e);

      while (array.length > 0) {
         let chunk = array.splice(0, 4).map((c) => {
            c = c.split(" - ");
            c = c[1].split(": ");
            return c;
         });

         products = [...products, chunk];
      }

      const requests = products.map(product => {
         let obj = {};
         product.forEach(p => {
            obj[p[0]] = p[1];
         });

         if (obj.result === "true") {

            // let req = axios.get('http://localhost:4000/products/fetch', {
            //     params: {
            //         product: JSON.parse(obj["POST PARAMETERS"])
            //     }
            // });

            /* -- OR -- */

            let req = axios.post(erpUrl, {
               product: JSON.parse(obj["POST PARAMETERS"])
            });

            return req;
         }
      }).filter(e => e);

      if (requests.length === 0) {
         notifier.notify({
            title: 'All products synced!',
            message: 'No products require sync from ERP'
         });

         console.log("No products require sync from ERP");
         return;
      }

      Promise.all(requests)
      .then((response) => {

         //todo check if product was fetched i.e. r.data.success
         res = response.map(r => {
            if (r.data.success) {
               return axios.post(siteUrl, {
                  mtrl: r.data.mtrl,
                  groupId: r.data.groupId
               })
            }
         })
         .filter(e => e);

         if (res.length > 0) {

            Promise.all(res)
            .then(res => {
               console.log(res)
               response = res.map(r => {
                  if (r.data.success) {
                     return r.data
                  }
               }).filter(e => e);

               if (response.length === 0) {
                  notifier.notify({
                     title: 'Error in product import',
                     message: 'Check SITE product controller'
                  });
               }

               notifier.notify({
                  title: 'Products imported',
                  message: 'Products successfully imported, check console for details'
               });

               let output = "";
               let timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
               response.forEach(r => {
                  console.log(`${timestamp} - ${r.mtrl}: ${r.groupId}`)
                  output += `${timestamp} - MTRL:${r.mtrl} GROUPID:${r.groupId}\r\n`;
               })

               fse.appendFileSync('./syncedProducts.log', output);

            })
            .catch(error => {
               notifier.notify({
                  title: 'Import failed',
                  message: 'Error in product import, check SITE url'
               });
               console.log("Save failed:", error);
            });
            
         } else {
            notifier.notify({
               title: 'No products',
               message: 'Fetched product array is empty'
            });
            console.log('No products successfully fetched');
         }

      })
      .catch(error => {
         notifier.notify({
            title: 'Fetch failed',
            message: 'No products fetched from ERP, check ERP url and credentials'
         });
         console.log("Fetch failed:", error)
      });

   });
