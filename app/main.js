"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("node:fs");
var crypto_1 = require("crypto");
var bencodec_1 = require("bencodec");
var decodeBencode_1 = require("./Bencode/decodeBencode");
var args = process.argv;
if (args[2] === "decode") {
    try {
        var bencodedValue = args[3];
        var decoded = (0, decodeBencode_1.decodeBencode)(bencodedValue);
        console.log(JSON.stringify(decoded));
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log("Unknown error occurred");
        }
    }
}
function extractPieceHashes(pieces) {
    var hashes = [];
    for (var i = 0; i < pieces.length; i += 20) {
        hashes.push(pieces.subarray(i, i + 20).toString('hex'));
    }
    return hashes;
}
if (args[2] === "info") {
    try {
        var torrentFilePath = args[3];
        var torrentFileData = fs.readFileSync(torrentFilePath);
        var decodedTorrentFile = bencodec_1.default.decode(torrentFileData);
        var fileInfo = decodedTorrentFile.info;
        var encodedInfo = bencodec_1.default.encode(fileInfo);
        var infoHash = (0, crypto_1.createHash)('sha1').update(encodedInfo).digest('hex');
        var pieceHashes = extractPieceHashes(fileInfo.pieces);
        console.log("Tracker URl: ".concat(decodedTorrentFile.announce));
        console.log("Length:", fileInfo.length);
        console.log("Info Hash: ".concat(infoHash));
        console.log("Piece Length:", fileInfo["piece length"]);
        console.log("Piece Hashes:");
        pieceHashes.forEach(function (hash, index) {
            console.log(index + 1, ":", hash);
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log("Unknown error occurred");
        }
    }
}
var parsePeers = function (peers) {
    var peerList = [];
    for (var i = 0; i < peers.length; i += 6) {
        // Extract 6-byte chunks
        var ipBytes = peers.slice(i, i + 4); // First 4 bytes for IP
        var portBytes = peers.slice(i + 4, i + 6); // Last 2 bytes for Port
        // Convert the IP bytes into an IPv4 address
        var ip = Array.from(ipBytes).join('.'); // Join byte values to form the IP address
        // Convert the port bytes into a port number
        var port = (portBytes[0] << 8) + portBytes[1]; // Convert bytes to a port number
        peerList.push("".concat(ip, ":").concat(port)); // Combine IP and port in the expected format
    }
    return peerList;
};
function urlEncodeHash(value) {
    var result = "";
    for (var index = 0; index < value.length; index++) {
        result += "%".concat(value.subarray(index, index + 1).toString("hex"));
    }
    return result;
}
if (args[2] === "peers") {
    try {
        var torrentFilePath = args[3];
        var torrentFileData = fs.readFileSync(torrentFilePath);
        var decodedTorrentFile = bencodec_1.default.decode(torrentFileData);
        var fileInfo = decodedTorrentFile.info;
        var encodedInfo = bencodec_1.default.encode(fileInfo);
        var info_hash = (0, crypto_1.createHash)('sha1').update(encodedInfo).digest();
        var req = {
            trackerUrl: decodedTorrentFile.announce,
            info_hash: urlEncodeHash(info_hash),
            peer_id: "00112233445566778899",
            port: 6881,
            uploaded: 0,
            downloaded: 0,
            left: fileInfo.length,
            compact: 1,
        };
        console.log("The Info Hash is: ", info_hash);
        var fetchUrl = "".concat(req.trackerUrl, "?peer_id=").concat(req.peer_id, "&info_hash=").concat(req.info_hash, "&port=").concat(req.port, "&uploaded=").concat(req.uploaded, "&downloaded=").concat(req.downloaded, "&left=").concat(req.left, "&compact=").concat(req.compact);
        var fetchTracker = function (URL) { return __awaiter(void 0, void 0, void 0, function () {
            var response, responseBuffer, decodedResponse, decodedPeers, parsedPeers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(URL)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        responseBuffer = _a.sent();
                        decodedResponse = bencodec_1.default.decode(Buffer.from(responseBuffer));
                        console.log("Decoded Response:", decodedResponse);
                        decodedPeers = decodedResponse.peers;
                        console.log("Peers:", decodedPeers);
                        console.log("Peers Length:", decodedPeers.length);
                        parsedPeers = parsePeers(decodedPeers);
                        console.log("Parsed Peers:", parsedPeers);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchTracker(fetchUrl);
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log("Unknown error occurred");
        }
    }
}
