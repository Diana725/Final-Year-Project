<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function __construct()
    {
        // Applying the auth middleware to all methods
        //$this->middleware('auth:sanctum');
    }

    public function addProduct(Request $req)
    {
        // Retrieve the currently authenticated user
        $user = Auth::guard('sanctum')->user();

        // Validate incoming request
        $req->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'quantity' => 'required|numeric',
            'payment_method' => 'required|string|max:255', // Validate payment method
            'file' => 'required|file|mimes:jpg,jpeg,png,gif', // Validate file upload
        ]);

        $product = new Product;
        $product->name = $req->input('name');
        $product->price = $req->input('price');
        $product->quantity = $req->input('quantity');
        $product->payment_method = $req->input('payment_method'); // Set payment method
        $product->file_path = $req->file('file')->store('products');
        $product->user_id = $user->id; // Assign the authenticated user ID
        $product->save();
    
        return response()->json([
            'message' => 'Product added successfully',
            'product' => $product,
        ]);
    }    

    public function list()
    {
        // Retrieve the currently authenticated user
        $user = Auth::guard('sanctum')->user();
        
        return Product::where('user_id', $user->id)->get();
    }

    public function delete($id)
    {
        // Retrieve the currently authenticated user
        $user = Auth::guard('sanctum')->user();

        $product = Product::where('id', $id)->where('user_id', $user->id)->delete();
        if ($product) {
            return ["result" => "Product has been deleted"];
        } else {
            return ["result" => "Operation Failed"];
        }
    }

    public function getProduct($id)
    {
        // Retrieve the currently authenticated user
        $user = Auth::guard('sanctum')->user();

        $product = Product::where('id', $id)->where('user_id', $user->id)->first();

        if ($product) {
            return response()->json($product);
        } else {
            return response()->json(['message' => 'Product not found'], 404);
        }
    }

    public function search($key)
    {
        // Retrieve the currently authenticated user
        $user = Auth::guard('sanctum')->user();

        return Product::where("name", "Like", "%$key%")->where('user_id', $user->id)->get();
    }

    public function update(Request $request, $id)
    {
        // Retrieve the currently authenticated user
        $user = Auth::guard('sanctum')->user();

        // Find the product by ID that belongs to the authenticated user
        $product = Product::where('id', $id)->where('user_id', $user->id)->first();

        // Check if the product exists and belongs to the user
        if (!$product) {
            return response()->json(['message' => 'Product not found or you do not have permission to edit this product'], 404);
        }

        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'quantity' => 'required|numeric',
            'payment_method' => 'required|string|max:255', // Validate payment method
            'file_path' => 'nullable|file|mimes:jpg,jpeg,png,gif', // Image validation
        ]);

        // Update product details
        $product->name = $request->name;
        $product->price = $request->price;
        $product->quantity = $request->quantity;
        $product->payment_method = $request->payment_method; // Update payment method

        // Handle the file upload if a new file is provided
        if ($request->hasFile('file_path')) {
            // Delete the old file if it exists
            if ($product->file_path && file_exists(public_path($product->file_path))) {
                unlink(public_path($product->file_path));
            }

            // Store the new file
            $filePath = $request->file('file_path')->store('products');
            $product->file_path = $filePath;
        }

        // Save the updated product
        $product->save();

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ], 200);
    }
}
