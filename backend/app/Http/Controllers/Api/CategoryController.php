<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(Request $request)
    {
        $query = Category::active();

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        } elseif ($request->boolean('root_only')) {
            $query->rootCategories();
        }

        $categories = $query->with('children')
            ->orderBy('sort_order')
            ->orderBy('name_fr')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    /**
     * Get single category with products
     */
    public function show($id)
    {
        $category = Category::with([
            'children',
            'products' => function ($query) {
                $query->active()->inStock()->limit(20);
            }
        ])->findOrFail($id);

        return response()->json(['category' => $category]);
    }

    /**
     * Get category tree
     */
    public function tree()
    {
        $categories = Category::active()
            ->rootCategories()
            ->with('children')
            ->orderBy('sort_order')
            ->orderBy('name_fr')
            ->get();

        return response()->json(['categories' => $categories]);
    }
}
