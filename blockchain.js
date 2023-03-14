const { createHash } = require('crypto')
const previoushashes = []
const chain = []
const blockids = []
let transcations = []
let transcationslist = []
let nonceList = []
let noOfBlocks = 1
let count = -1
let mine = false




function hash(input) {
    return createHash('sha256').update(input).digest('hex')
}


class Merkletree {

    constructor(transcations) {
        this.root = this.buildMerkletree(transcations)//Transcations inside the block
        transcationslist.push(transcations)
    }

    buildMerkletree([...items]) {
        if (items.length == 1) {//Single Transcation
            transcations = []
            return hash(items[0])
        }

        if (items.length % 2 != 0) {//Odd number of Transcations
            items.push(items[items.length - 1])
        }

        const finalitem = []
        for (let i = 0; i < items.length; i += 2) {
            const item1 = hash(items[i])
            const item2 = hash(items[i + 1])
            const combineditem = item1 + item2
            finalitem.push(combineditem)
        }
        return this.buildMerkletree(finalitem)

    }
}


class transcationHash {

    constructor(transcationid, source, destination, amount) {
        this.transcationid = transcationid
        this.source = source
        this.destination = destination
        this.amount = amount
      
    }

    validTranscation() {//
        if (this.source == this.destination) return "Transcation not valid"
        if (typeof (this.source) != String || typeof (this.destination) != String || typeof (amount) != Number) return "Data not valid"
        else return `Transcation${transcationid} verified`
    }

    gethash() {//Transcation hash
        return hash(this.transcationid+this.source + this.destination + this.amount).toString()
    }


}


class Block {

    constructor(transcation, timestamp = Date.now(), difficulty = 3) {
        this.blockid = noOfBlocks
        this.timestamp = timestamp
        this.difficulty = difficulty
        this.nonce = 0
        this.transcation = transcation
        this.previousHash = this.prevHash()
        this.currentHash = this.targethash(transcation)
        this.Mining = this.mining(this.currentHash)
        this.output = this.display()

    }

    prevHash() {
        return previoushashes.length != 0 ? previoushashes[previoushashes.length - 1] : '0'.repeat(64)
    }

    targethash(transHash) {

        if (blockids.includes(this.blockid)) {
            return hash(this.blockid + this.nonce + this.timestamp + transHash + this.previoushash)
        }

        else {
                noOfBlocks += 1
                const now = new Date()
                now.setMonth(noOfBlocks + 1)
                now.setHours(noOfBlocks)
                now.setMinutes(noOfBlocks + 30);
                const date = new Date(now)
                const formattedDate = date.toLocaleDateString('en-US');
                const formattedTime = date.toLocaleTimeString('en-US');
                this.timestamp = formattedDate + " " + formattedTime
                this.currentHash = hash(this.blockid + this.nonce + this.timestamp + transHash + this.previoushash).toString()
                return this.currentHash
           

        }
    }

    mining(temphash) {//Getting the desired current hash with the given difficulty
        let target = Array(this.difficulty + 1).join('0')
        while (true) {
            if (temphash.substring(0, this.difficulty) == target && !nonceList.includes(this.nonce)) {
                if (!mine) {
                    previoushashes.push(temphash)
                    nonceList.push(this.nonce)
                }
                
                return this.currentHash
            }
            else {
                this.nonce++
                this.currentHash = hash(this.blockid + this.nonce + this.timestamp + temphash + this.previoushash)
                temphash = this.currentHash

            }
        }
    }

    display() {
        count += 1
        const obj = { blockid: this.blockid, nonce: this.nonce, timestamp: this.timestamp, transcation: this.transcation, previousHash: this.previousHash, currentHash: previoushashes[count] }
        chain.push(obj)
        blockids.push(this.blockid)


    }

}

function Blockchain() {


    //Block1 containing a list of transcations
    const transcation1 = new transcationHash('1', 'Ram', 'Raghu', 10000)
    const transcation2 = new transcationHash('2', 'Kiran', 'Rahul', 7000)
    const transcation3 = new transcationHash('3', 'Ramesh', 'Suresh', 14000)
    transcations.push(transcation1.gethash(), transcation2.gethash(), transcation3.gethash())
    const block1 = new Block(new Merkletree(transcations))


    //Block2 constaining a single transaction
    const transcation4 = new transcationHash('4', 'Bob', 'Alice', 5000)
    transcations.push(transcation4.gethash())
    const block2 = new Block(new Merkletree(transcations))

    //Block3 containing a list of transcations
    const transcation5 = new transcationHash('5', 'Raj', 'Raghu', 8000)
    const transcation6 = new transcationHash('6', 'Lokesh', 'Ganesh', 40000)
    transcations.push(transcation5.gethash(), transcation6.gethash())
    const block3 = new Block(new Merkletree(transcations))


    let listOfTranscations = [transcation1,transcation2,transcation3,transcation4,transcation5,transcation6]
    //Tampering with the Blockchain
    let Transindex = 1
    listOfTranscations[Transindex].amount = 40000
   
    let blocks = [block1,block2,block3]

    newTransHashes = []
    for (let i of transcationslist) {
        newTransHashes.push(...i)
    }

    newTransHashes[Transindex] = listOfTranscations[Transindex].gethash()
    


    function verification() {
        let tempblock;
        let i = 0
        let index

        outerloop:
        for (let ind = 0; ind < transcationslist.length; ind++) {
            for (let innerind = 0; innerind < transcationslist[ind].length; innerind++) {
                if (newTransHashes[i] != transcationslist[ind][innerind]) {
                    transcationslist[ind][innerind] = newTransHashes[i]
                    tempblock = transcationslist[ind]
                    index = ind
                    break outerloop
              
                }
                i += 1
            }
        }


        if (tempblock) {
            const changed = new Merkletree(tempblock)
            chain[index].transcation = changed
            let curr = blocks[index].targethash(changed)
            mine = true
            if (blocks[index].mining(curr) != chain[index].currentHash ) {
              
                chain[index].currentHash = blocks[index].mining(curr)
                console.log(chain)
                console.log("Before changing,currenthash",chain[index].currentHash)
                console.log(`Data changed in block${index+1}!!!`)
                console.log("After changing,currenthash", curr)
                console.log("After mining,currenthash", blocks[index].mining(curr))
                console.log("Blockchain Verification Failed :(")
                
            }

            for (let i = 0; i < chain.length; i++) {
                if (i == chain.length - 1) break
                else if (chain[i].currentHash != chain[i + 1].previousHash) {
                    console.log("Blockchain not properly linked")

                }
            }
            
        }

        else {
            console.log(chain)
            console.log("\nBlockchain verified successfully :)")
        }


    }
    verification()
}
Blockchain()
console.log(nonceList)





