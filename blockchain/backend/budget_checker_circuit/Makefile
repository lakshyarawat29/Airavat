BUILD_DIR = ./setup
PHASE1 = ./powersOfTau28_hez_final_15.ptau

# Targets
all: $(BUILD_DIR)/circuit_final.zkey $(BUILD_DIR)/verification_key.json

# Circuit compilation
$(BUILD_DIR)/circuit.r1cs: circuit.circom 
	@mkdir -p $(BUILD_DIR)
	circom --inspect -p bn128 -o $(BUILD_DIR) --r1cs circuit.circom -l ../node_modules/

# Witness generator
$(BUILD_DIR)/circuit.wasm: circuit.circom
	@mkdir -p $(BUILD_DIR)
	circom --wasm -o $(BUILD_DIR) circuit.circom -l ../node_modules/

# Powers of Tau ceremony
$(PHASE1):
	wget -O $(PHASE1) https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_15.ptau

# Phase 2 setup
$(BUILD_DIR)/circuit_0000.zkey: $(BUILD_DIR)/circuit.r1cs $(PHASE1)
	snarkjs groth16 setup $(BUILD_DIR)/circuit.r1cs $(PHASE1) $(BUILD_DIR)/circuit_0000.zkey

# Contribution
$(BUILD_DIR)/circuit_final.zkey: $(BUILD_DIR)/circuit_0000.zkey
	snarkjs zkey contribute $(BUILD_DIR)/circuit_0000.zkey $(BUILD_DIR)/circuit_final.zkey --name="1st Contributor" -v -e="random text"

# Verification key
$(BUILD_DIR)/verification_key.json: $(BUILD_DIR)/circuit_final.zkey
	snarkjs zkey export verificationkey $(BUILD_DIR)/circuit_final.zkey $(BUILD_DIR)/verification_key.json

# Setup phase
setup: $(BUILD_DIR)/circuit.wasm $(BUILD_DIR)/circuit_final.zkey $(BUILD_DIR)/verification_key.json
	@echo "✅ Budget checker circuit setup complete"

# Clean
clean:
	rm -rf $(BUILD_DIR)

# Deep clean
dist-clean: clean
	rm -f $(PHASE1)

.PHONY: all setup clean dist-clean