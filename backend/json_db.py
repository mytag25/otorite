
import json
import os
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class AsyncJsonCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    async def find_one(self, filter_doc: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = self.db._get_collection_data(self.name)
        for item in data:
            if self._matches(item, filter_doc):
                return item
        return None

    def find(self, filter_doc: Dict[str, Any] = None):
        # Returns a cursor-like object
        return AsyncJsonCursor(self.db, self.name, filter_doc)

    async def insert_one(self, document: Dict[str, Any]):
        if "_id" not in document:
            document["_id"] = str(datetime.now().timestamp()) # Simple ID generation
        
        data = self.db._get_collection_data(self.name)
        
        # Check uniqueness for simple fields if needed, but skipping for MVP
        
        data.append(document)
        await self.db._save()
        return InsertResult(document["_id"])

    async def insert_many(self, documents: List[Dict[str, Any]]):
        ids = []
        data = self.db._get_collection_data(self.name)
        for doc in documents:
            if "_id" not in doc:
                doc["_id"] = str(datetime.now().timestamp()) + "-" + str(uuid.uuid4())
            data.append(doc)
            ids.append(doc["_id"])
        
        await self.db._save()
        return InsertManyResult(ids)

    async def update_one(self, filter_doc: Dict[str, Any], update_doc: Dict[str, Any]):
        data = self.db._get_collection_data(self.name)
        for item in data:
            if self._matches(item, filter_doc):
                self._apply_update(item, update_doc)
                await self.db._save()
                return UpdateResult(1)
        return UpdateResult(0)

    async def delete_one(self, filter_doc: Dict[str, Any]):
        data = self.db._get_collection_data(self.name)
        for i, item in enumerate(data):
            if self._matches(item, filter_doc):
                del data[i]
                await self.db._save()
                return DeleteResult(1)
        return DeleteResult(0)
    
    async def count_documents(self, filter_doc: Dict[str, Any]) -> int:
        data = self.db._get_collection_data(self.name)
        count = 0
        for item in data:
            if self._matches(item, filter_doc):
                count += 1
        return count

    async def create_index(self, keys, unique=False):
        # Check uniqueness immediately if data exists? 
        # For MVP, we just log it.
        logger.info(f"Mock Index created on {self.name}: {keys} (unique={unique})")
        return "index_name"

    def _matches(self, item, filter_doc):
        if not filter_doc:
            return True
        
        for k, v in filter_doc.items():
            # Support $or operator
            if k == "$or":
                if not isinstance(v, list):
                    return False
                or_match = False
                for sub_filter in v:
                    if self._matches(item, sub_filter):
                        or_match = True
                        break
                if not or_match:
                    return False
                continue
            
            # Support $and operator
            if k == "$and":
                if not isinstance(v, list):
                    return False
                for sub_filter in v:
                    if not self._matches(item, sub_filter):
                        return False
                continue
            
            # Get the value from item (support nested keys like "scores.overall.score")
            item_value = self._get_nested_value(item, k)
            
            # If v is a dict, it contains operators
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$regex":
                        import re
                        flags = 0
                        if "$options" in v and "i" in v["$options"]:
                            flags = re.IGNORECASE
                        if item_value is None or not re.search(op_val, str(item_value), flags):
                            return False
                    elif op == "$gte":
                        if item_value is None or item_value < op_val:
                            return False
                    elif op == "$lte":
                        if item_value is None or item_value > op_val:
                            return False
                    elif op == "$gt":
                        if item_value is None or item_value <= op_val:
                            return False
                    elif op == "$lt":
                        if item_value is None or item_value >= op_val:
                            return False
                    elif op == "$ne":
                        if item_value == op_val:
                            return False
                    elif op == "$in":
                        if item_value not in op_val:
                            return False
                    elif op == "$options":
                        # This is handled with $regex
                        pass
            else:
                # Simple equality check
                if item_value != v:
                    return False
        return True
    
    def _get_nested_value(self, item, key):
        """Get value from nested dict using dot notation like 'scores.overall.score'"""
        keys = key.split('.')
        value = item
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return None
        return value

    def _apply_update(self, item, update_doc):
        # Support only $set for now
        if "$set" in update_doc:
            for k, v in update_doc["$set"].items():
                item[k] = v
        # Support $inc
        if "$inc" in update_doc:
            for k, v in update_doc["$inc"].items():
                item[k] = item.get(k, 0) + v
        # Support $push
        if "$push" in update_doc:
            for k, v in update_doc["$push"].items():
                if k not in item:
                    item[k] = []
                if isinstance(item[k], list):
                    item[k].append(v)
        # Support $pull
        if "$pull" in update_doc:
             for k, v in update_doc["$pull"].items():
                 if k in item and isinstance(item[k], list):
                      new_list = []
                      for elem in item[k]:
                           should_remove = False
                           if isinstance(v, dict):
                                # Partial match for dict (e.g. {"id": "..."})
                                matches = True
                                for sub_k, sub_v in v.items():
                                     if elem.get(sub_k) != sub_v:
                                          matches = False
                                          break
                                if matches: should_remove = True
                           else:
                                if elem == v: should_remove = True
                           
                           if not should_remove:
                                new_list.append(elem)
                      item[k] = new_list

class AsyncJsonCursor:
    def __init__(self, db, name, filter_doc):
        self.db = db
        self.name = name
        self.filter_doc = filter_doc
        self._limit = 0
        self._skip = 0
        self._sort = None

    def sort(self, key_or_list, direction=1):
        self._sort = (key_or_list, direction)
        return self

    def limit(self, length):
        self._limit = length
        return self
        
    def skip(self, num):
        self._skip = num
        return self

    async def to_list(self, length=None):
        data = self.db._get_collection_data(self.name)
        filtered = []
        for item in data:
            # We need to access the collection helper to use _matches logic properly
            # but for simplicity I duplicated basic logic or could move it to DB
             if self._matches(item, self.filter_doc):
                 filtered.append(item)
        
        # Sort
        if self._sort:
            # Handle list of tuples vs single key
            key, direction = self._sort if isinstance(self._sort, tuple) else (self._sort, 1)
            # Very basic sort
            if isinstance(key, str):
                def get_sort_key(item):
                    val = item.get(key)
                    if val is None:
                        return ""
                    return str(val)
                filtered.sort(key=get_sort_key, reverse=(direction == -1))
            elif isinstance(key, list):
                 # Support list of tuples for sort
                 pass 

        # Skip & Limit
        if self._skip > 0:
            filtered = filtered[self._skip:]
        
        if length is not None:
             filtered = filtered[:length]
        elif self._limit > 0:
             filtered = filtered[:self._limit]
             
        return filtered

    def _matches(self, item, filter_doc):
        if not filter_doc:
            return True
        
        for k, v in filter_doc.items():
            # Support $or operator
            if k == "$or":
                if not isinstance(v, list):
                    return False
                or_match = False
                for sub_filter in v:
                    if self._matches(item, sub_filter):
                        or_match = True
                        break
                if not or_match:
                    return False
                continue
            
            # Support $and operator
            if k == "$and":
                if not isinstance(v, list):
                    return False
                for sub_filter in v:
                    if not self._matches(item, sub_filter):
                        return False
                continue
            
            # Get the value from item (support nested keys like "scores.overall.score")
            item_value = self._get_nested_value(item, k)
            
            # If v is a dict, it contains operators
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$regex":
                        import re
                        flags = 0
                        if "$options" in v and "i" in v["$options"]:
                            flags = re.IGNORECASE
                        if item_value is None or not re.search(op_val, str(item_value), flags):
                            return False
                    elif op == "$gte":
                        if item_value is None or item_value < op_val:
                            return False
                    elif op == "$lte":
                        if item_value is None or item_value > op_val:
                            return False
                    elif op == "$gt":
                        if item_value is None or item_value <= op_val:
                            return False
                    elif op == "$lt":
                        if item_value is None or item_value >= op_val:
                            return False
                    elif op == "$ne":
                        if item_value == op_val:
                            return False
                    elif op == "$in":
                        if item_value not in op_val:
                            return False
                    elif op == "$options":
                        # This is handled with $regex
                        pass
            else:
                # Simple equality check
                if item_value != v:
                    return False
        return True
    
    def _get_nested_value(self, item, key):
        """Get value from nested dict using dot notation like 'scores.overall.score'"""
        keys = key.split('.')
        value = item
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return None
        return value
    
    def __aiter__(self):
        # To support "async for doc in cursor"
        self._iter_index = 0
        self._iter_data = None
        return self

    async def __anext__(self):
        if self._iter_data is None:
             self._iter_data = await self.to_list()
        
        if self._iter_index < len(self._iter_data):
            val = self._iter_data[self._iter_index]
            self._iter_index += 1
            return val
        else:
            raise StopAsyncIteration

class AsyncJsonDatabase:
    def __init__(self, file_path="local_db.json"):
        self.file_path = file_path
        self._data = {}
        self._lock = asyncio.Lock()
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    # Handle json decode error
                    content = f.read()
                    if content:
                        self._data = json.loads(content)
                    else:
                        self._data = {}
            except Exception as e:
                logger.error(f"Failed to load DB: {e}")
                self._data = {}
        else:
            self._data = {}

    async def _save(self):
        async with self._lock:
            # Use run_in_executor to avoid blocking event loop with file I/O
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._write_file)

    def _write_file(self):
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(self._data, f, indent=2, default=str)

    def _get_collection_data(self, name):
        if name not in self._data:
            self._data[name] = []
        return self._data[name]

    def __getattr__(self, name):
        return AsyncJsonCollection(self, name)

    def __getitem__(self, name):
        return AsyncJsonCollection(self, name)

    async def command(self, cmd, *args, **kwargs):
        if cmd == 'ping':
            return {'ok': 1}
        return {'ok': 1}

class AsyncJsonClient:
    def __init__(self, *args, **kwargs):
        self.db = AsyncJsonDatabase()
        logger.info("AsyncJsonClient Initialized with local_db.json")

    def __getitem__(self, name):
        return self.db

    def close(self):
        pass

# Helpers for result objects
class InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class UpdateResult:
    def __init__(self, modified_count):
        self.modified_count = modified_count

class DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count

class InsertManyResult:
    def __init__(self, inserted_ids):
        self.inserted_ids = inserted_ids
