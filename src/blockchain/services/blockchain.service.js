import { ethers } from "ethers";

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "https://rpc.sepolia.org";
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  "function registrarBoletin(string memory _hashBoletin, string memory _estudianteId) public",
  "function verificarBoletin(string memory _hashBoletin) public view returns (bool esValido, string memory estudianteId, uint256 fechaRegistro)",
  "function revocarBoletin(string memory _hashBoletin) public"
];

class BlockchainService {
  constructor() {
    if (PRIVATE_KEY && CONTRACT_ADDRESS) {
      this.provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
        staticNetwork: true
      });
      this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    } else {
      console.warn("⚠️ BlockchainService: Falta configuración en el archivo .env");
    }
  }

  async registrarEnBlockchain(hashBoletin, estudianteId, awaitConfirmation = false) {
    try {
      if (!this.contract) {
        return { 
          success: true, 
          yaExistia: false,
          txHash: "0x_simulated_tx_" + Date.now() 
        };
      }

      const feeData = await this.provider.getFeeData();

      const tx = await this.contract.registrarBoletin(hashBoletin, String(estudianteId), {
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
      });

      if (!awaitConfirmation) {
        tx.wait(1).then((receipt) => {
          console.log(` Transacción minada exitosamente en bloque #${receipt.blockNumber} (TX: ${receipt.hash})`);
        }).catch((err) => {
          console.error(` Error en minado Web3 (TX: ${tx.hash}):`, err.message);
        });

        return {
          success: true,
          yaExistia: false,
          txHash: tx.hash,
          estado: "pendiente_minado"
        };
      }

      const receipt = await tx.wait(1);

      return {
        success: true,
        yaExistia: false,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        estado: "confirmado"
      };

    } catch (error) {
      const mensajeError = error.reason || error.message || "";
      const errorString = JSON.stringify(error);

      if (
        mensajeError.includes("El boletin ya esta registrado") ||
        errorString.includes("El boletin ya esta registrado") ||
        error.code === "CALL_EXCEPTION"
      ) {
        return {
          success: true,
          yaExistia: true,
          hash: hashBoletin,
          txHash: error.transactionHash || null,
          message: "El certificado ya se encuentra registrado en la red Blockchain."
        };
      }

      console.error("Error al registrar en Blockchain:", error);
      throw new Error(`Fallo de registro Web3: ${error.message}`);
    }
  }

  async verificarEnBlockchain(hashBoletin) {
    try {
      if (!this.contract) {
        return { esValido: true, estudianteId: "", fechaRegistro: new Date() };
      }

      const [esValido, estudianteId, fechaRegistro] = await this.contract.verificarBoletin(hashBoletin);

      return {
        esValido,
        estudianteId: String(estudianteId),
        fechaRegistro: new Date(Number(fechaRegistro) * 1000)
      };
    } catch (error) {
      console.error("Error al verificar en Blockchain:", error);
      return { esValido: false, error: error.message };
    }
  }
}

export const blockchainService = new BlockchainService();