use std::collections::HashMap;
use risc0_build::embed_methods_with_options;

fn main() {
    // Discover guest packages from [package.metadata.risc0.methods] in Cargo.toml.
    // Pass empty HashMap to use default options for all discovered guests.
    embed_methods_with_options(HashMap::new());
}
